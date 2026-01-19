---
id: pt-client-fetch
name: Client-side Data Fetching
version: 2.1.0
layer: L5
category: data
description: Client-side data fetching patterns using native fetch, React Query, and SWR
tags: [data, client, fetch, react-query, swr, next15, react19]
composes:
  - ../atoms/display-skeleton.md
  - ../atoms/feedback-spinner.md
  - ../atoms/feedback-alert.md
  - ../atoms/input-button.md
  - ../molecules/card.md
dependencies: []
formula: "ClientFetch = useFetch + useQuery + useSWR + Skeleton(a-display-skeleton) + Alert(a-feedback-alert)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Client-side Data Fetching

## Overview

While Server Components are preferred for initial data loading, client-side fetching is essential for user interactions, polling, infinite scroll, and real-time updates. This pattern covers multiple approaches with proper loading, error, and caching states.

## When to Use

- User-triggered data refreshes
- Polling for real-time updates
- Infinite scroll implementations
- Search/autocomplete inputs
- Data dependent on user interactions

## Composition Diagram

```
+------------------------------------------+
|          Client Fetch Pattern            |
|  +------------------------------------+  |
|  |    User Interaction (click, etc)  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |  useFetch / useQuery / useSWR     |  |
|  +------------------------------------+  |
|           |                             |
|     +-----+-----+-----+                 |
|     |     |     |     |                 |
|     v     v     v     v                 |
| Loading  Data  Error  Refetch          |
| Skeleton Card  Alert  Button           |
+------------------------------------------+
```

## Native Fetch with useState

```typescript
// hooks/use-fetch.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useFetch<T>(
  url: string,
  options?: RequestInit
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        isLoading: false,
      });
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// Usage
// components/user-profile.tsx
'use client';

import { useFetch } from '@/hooks/use-fetch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch } = useFetch<User>(
    `/api/users/${userId}`
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <h2 className="font-semibold">{data?.name}</h2>
      <p className="text-muted-foreground">{data?.email}</p>
    </div>
  );
}
```

## React Query Integration

```typescript
// lib/react-query.ts
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// hooks/use-users.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}

// Query hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Option 1: Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Option 2: Update cache directly
      queryClient.setQueryData<User[]>(['users'], (old) => {
        return old ? [...old, newUser] : [newUser];
      });
    },
  });
}

// components/users-list.tsx
'use client';

import { useUsers, useCreateUser } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function UsersList() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y">
        {users?.map((user) => (
          <li key={user.id} className="py-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={() =>
          createUser.mutate({ name: 'New User', email: 'new@example.com' })
        }
        disabled={createUser.isPending}
      >
        {createUser.isPending ? 'Adding...' : 'Add User'}
      </Button>
    </div>
  );
}
```

## SWR Integration

```typescript
// hooks/use-swr-users.ts
'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

interface User {
  id: string;
  name: string;
  email: string;
}

export function useUsers() {
  return useSWR<User[]>('/api/users', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useUser(id: string | null) {
  return useSWR<User>(
    id ? `/api/users/${id}` : null,
    fetcher
  );
}

// Mutation with optimistic updates
async function createUserFetcher(
  url: string,
  { arg }: { arg: Omit<User, 'id'> }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}

export function useCreateUser() {
  return useSWRMutation('/api/users', createUserFetcher, {
    revalidate: true,
  });
}

// components/swr-users-list.tsx
'use client';

import { useUsers, useCreateUser } from '@/hooks/use-swr-users';
import { Button } from '@/components/ui/button';

export function SWRUsersList() {
  const { data: users, error, isLoading, mutate } = useUsers();
  const { trigger, isMutating } = useCreateUser();

  const handleCreate = async () => {
    // Optimistic update
    const optimisticUser = {
      id: 'temp-id',
      name: 'New User',
      email: 'new@example.com',
    };

    await mutate(
      async () => {
        const newUser = await trigger({
          name: 'New User',
          email: 'new@example.com',
        });
        return users ? [...users, newUser] : [newUser];
      },
      {
        optimisticData: users ? [...users, optimisticUser] : [optimisticUser],
        rollbackOnError: true,
      }
    );
  };

  if (error) return <p className="text-destructive">Error loading users</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <Button onClick={handleCreate} disabled={isMutating}>
        Add User
      </Button>
    </div>
  );
}
```

## Polling Pattern

```typescript
// hooks/use-polling.ts
'use client';

import { useQuery } from '@tanstack/react-query';

interface NotificationCount {
  unread: number;
  total: number;
}

async function fetchNotificationCount(): Promise<NotificationCount> {
  const res = await fetch('/api/notifications/count');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function useNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: fetchNotificationCount,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
  });
}

// With SWR
import useSWR from 'swr';

export function useNotificationCountSWR() {
  return useSWR<NotificationCount>(
    '/api/notifications/count',
    fetcher,
    {
      refreshInterval: 30000,
      refreshWhenHidden: false,
    }
  );
}

// components/notification-badge.tsx
'use client';

import { useNotificationCount } from '@/hooks/use-polling';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationBadge() {
  const { data } = useNotificationCount();

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {data && data.unread > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
          {data.unread > 99 ? '99+' : data.unread}
        </span>
      )}
    </Button>
  );
}
```

## Conditional Fetching

```typescript
// hooks/use-search.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'post' | 'user';
}

async function searchApi(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export function useSearch(query: string) {
  const [debouncedQuery] = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // Only search with 2+ characters
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous results while loading
  });
}

// components/search-input.tsx
'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/use-search';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading, isFetching } = useSearch(query);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="pl-9"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
        )}
      </div>

      {results && results.length > 0 && (
        <ul className="absolute top-full mt-2 w-full bg-popover border rounded-md shadow-md z-10">
          {results.map((result) => (
            <li key={result.id} className="px-4 py-2 hover:bg-accent cursor-pointer">
              {result.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Parallel Queries

```typescript
// hooks/use-dashboard-data.ts
'use client';

import { useQueries } from '@tanstack/react-query';

interface DashboardData {
  stats: Stats | undefined;
  recentActivity: Activity[] | undefined;
  notifications: Notification[] | undefined;
  isLoading: boolean;
  hasError: boolean;
}

export function useDashboardData(): DashboardData {
  const results = useQueries({
    queries: [
      {
        queryKey: ['stats'],
        queryFn: () => fetch('/api/stats').then((r) => r.json()),
      },
      {
        queryKey: ['activity'],
        queryFn: () => fetch('/api/activity').then((r) => r.json()),
      },
      {
        queryKey: ['notifications'],
        queryFn: () => fetch('/api/notifications').then((r) => r.json()),
      },
    ],
  });

  return {
    stats: results[0].data,
    recentActivity: results[1].data,
    notifications: results[2].data,
    isLoading: results.some((r) => r.isLoading),
    hasError: results.some((r) => r.isError),
  };
}
```

## Anti-patterns

### Don't Fetch in useEffect Without Cleanup

```typescript
// BAD - Race condition, no cleanup
useEffect(() => {
  fetch('/api/data').then((r) => r.json()).then(setData);
}, []);

// GOOD - With cleanup
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== 'AbortError') throw e;
    });

  return () => controller.abort();
}, []);
```

### Don't Ignore Loading States

```typescript
// BAD - Assumes data exists
function UserProfile({ userId }) {
  const { data } = useUser(userId);
  return <h1>{data.name}</h1>; // Will crash if data is undefined
}

// GOOD - Handle all states
function UserProfile({ userId }) {
  const { data, isLoading, error } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return null;
  
  return <h1>{data.name}</h1>;
}
```

## Related Skills

- [react-query](./react-query.md)
- [swr](./swr.md)
- [prefetching](./prefetching.md)
- [infinite-scroll](./infinite-scroll.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Native fetch hook
- React Query integration
- SWR integration
- Polling patterns
- Conditional fetching
