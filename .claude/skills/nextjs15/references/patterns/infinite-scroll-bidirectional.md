---
id: pt-infinite-scroll-bidirectional
name: Bidirectional Infinite Scroll
version: 2.0.0
layer: L5
category: data
description: Infinite scroll that loads content in both directions (up and down)
tags: [infinite-scroll, bidirectional, virtualization, chat, timeline, pagination]
composes: []
formula: "BidirectionalScroll = DualCursors + ScrollPositionMaintenance + IntersectionObserver + ReactQuery"
dependencies:
  - react
  - "@tanstack/react-query"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Bidirectional Infinite Scroll

## When to Use

- Building chat interfaces where users scroll up to load history
- Creating timeline views (activity logs, version history)
- Implementing message threads with context loading
- Building social feeds with "load newer" and "load older"
- Displaying transaction histories with date-based navigation
- Any list where users might land in the middle and scroll both ways

## Composition Diagram

```
[Scroll Container]
        |
        +---> [Top Sentinel] --Intersection--> [Fetch Previous Page]
        |         |
        |         +---> [Save Scroll Position]
        |         +---> [Prepend Items]
        |         +---> [Restore Scroll Position]
        |
        +---> [Items List]
        |         |
        |         +---> [Previous Pages (reversed)]
        |         +---> [Current Page]
        |         +---> [Next Pages]
        |
        +---> [Bottom Sentinel] --Intersection--> [Fetch Next Page]
        |
        +---> [React Query]
                  |
                  +---> [useInfiniteQuery('next')]
                  +---> [useInfiniteQuery('prev')]
                  +---> [Cursor-based Pagination]
```

## Overview

Implement infinite scroll that loads content in both directions, ideal for chat applications, timelines, and feeds where users need to scroll both up (older content) and down (newer content).

## Implementation

### Types

```tsx
// lib/bidirectional-scroll/types.ts
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string | null;
  prevCursor?: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface ScrollPosition {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface BidirectionalScrollState {
  isLoadingNext: boolean;
  isLoadingPrev: boolean;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error: string | null;
}
```

### Bidirectional Scroll Hook

```tsx
// hooks/use-bidirectional-scroll.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PaginatedResponse, ScrollPosition } from '@/lib/bidirectional-scroll/types';

interface UseBidirectionalScrollOptions<T> {
  queryKey: string[];
  fetchPage: (cursor?: string, direction?: 'next' | 'prev') => Promise<PaginatedResponse<T>>;
  initialCursor?: string;
  threshold?: number; // pixels from edge to trigger load
}

export function useBidirectionalScroll<T>({
  queryKey,
  fetchPage,
  initialCursor,
  threshold = 200,
}: UseBidirectionalScrollOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMaintainPosition, setShouldMaintainPosition] = useState(false);
  const previousScrollHeightRef = useRef<number>(0);
  const previousScrollTopRef = useRef<number>(0);

  // Query for next pages (scrolling down)
  const {
    data: nextData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKey, 'next'],
    queryFn: async ({ pageParam }) => {
      return fetchPage(pageParam, 'next');
    },
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Query for previous pages (scrolling up)
  const {
    data: prevData,
    fetchNextPage: fetchPrevPage,
    hasNextPage: hasPrevPage,
    isFetchingNextPage: isFetchingPrevPage,
  } = useInfiniteQuery({
    queryKey: [...queryKey, 'prev'],
    queryFn: async ({ pageParam }) => {
      return fetchPage(pageParam, 'prev');
    },
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => lastPage.prevCursor,
    enabled: false, // Only fetch when explicitly triggered
  });

  // Combine all items in correct order
  const items = [
    ...(prevData?.pages.flatMap((p) => p.items).reverse() || []),
    ...(nextData?.pages.flatMap((p) => p.items) || []),
  ];

  // Maintain scroll position when prepending items
  useEffect(() => {
    if (!shouldMaintainPosition || !containerRef.current) return;

    const container = containerRef.current;
    const newScrollHeight = container.scrollHeight;
    const heightDiff = newScrollHeight - previousScrollHeightRef.current;

    if (heightDiff > 0) {
      container.scrollTop = previousScrollTopRef.current + heightDiff;
    }

    setShouldMaintainPosition(false);
  }, [prevData, shouldMaintainPosition]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if near bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }

    // Check if near top
    if (scrollTop < threshold) {
      if (hasPrevPage && !isFetchingPrevPage) {
        // Save position before fetching
        previousScrollHeightRef.current = scrollHeight;
        previousScrollTopRef.current = scrollTop;
        setShouldMaintainPosition(true);
        fetchPrevPage();
      }
    }
  }, [
    hasNextPage,
    hasPrevPage,
    isFetchingNextPage,
    isFetchingPrevPage,
    fetchNextPage,
    fetchPrevPage,
    threshold,
  ]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    const item = container.children[index] as HTMLElement;
    if (item) {
      item.scrollIntoView({ behavior, block: 'center' });
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  // Scroll to top
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: 0,
      behavior,
    });
  }, []);

  return {
    items,
    containerRef,
    handleScroll,
    isLoadingNext: isFetchingNextPage,
    isLoadingPrev: isFetchingPrevPage,
    hasNextPage: !!hasNextPage,
    hasPrevPage: !!hasPrevPage,
    scrollToItem,
    scrollToBottom,
    scrollToTop,
  };
}
```

### Bidirectional List Component

```tsx
// components/bidirectional-list.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { useBidirectionalScroll } from '@/hooks/use-bidirectional-scroll';
import { PaginatedResponse } from '@/lib/bidirectional-scroll/types';

interface BidirectionalListProps<T> {
  queryKey: string[];
  fetchPage: (cursor?: string, direction?: 'next' | 'prev') => Promise<PaginatedResponse<T>>;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string | number;
  initialCursor?: string;
  className?: string;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
}

export function BidirectionalList<T>({
  queryKey,
  fetchPage,
  renderItem,
  getItemKey,
  initialCursor,
  className = '',
  emptyMessage = 'No items to display',
  loadingComponent,
}: BidirectionalListProps<T>) {
  const {
    items,
    containerRef,
    handleScroll,
    isLoadingNext,
    isLoadingPrev,
    hasNextPage,
    hasPrevPage,
    scrollToBottom,
  } = useBidirectionalScroll<T>({
    queryKey,
    fetchPage,
    initialCursor,
  });

  const defaultLoader = (
    <div className="flex justify-center py-4">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );

  const loader = loadingComponent || defaultLoader;

  if (items.length === 0 && !isLoadingNext && !isLoadingPrev) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        {/* Top loading indicator */}
        {isLoadingPrev && loader}

        {/* Top sentinel for loading more */}
        {hasPrevPage && !isLoadingPrev && (
          <div className="flex justify-center py-2">
            <ChevronUp className="w-5 h-5 text-gray-400 animate-bounce" />
          </div>
        )}

        {/* Items */}
        {items.map((item, index) => (
          <div key={getItemKey(item)}>{renderItem(item, index)}</div>
        ))}

        {/* Bottom sentinel for loading more */}
        {hasNextPage && !isLoadingNext && (
          <div className="flex justify-center py-2">
            <ChevronDown className="w-5 h-5 text-gray-400 animate-bounce" />
          </div>
        )}

        {/* Bottom loading indicator */}
        {isLoadingNext && loader}
      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={() => scrollToBottom()}
        className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
```

### Chat Component with Bidirectional Scroll

```tsx
// components/chat-messages.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useBidirectionalScroll } from '@/hooks/use-bidirectional-scroll';
import { Loader2, ArrowDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isOwn?: boolean;
}

interface ChatMessagesProps {
  channelId: string;
  currentUserId: string;
}

export function ChatMessages({ channelId, currentUserId }: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);

  const fetchMessages = async (cursor?: string, direction?: 'next' | 'prev') => {
    const params = new URLSearchParams({ channelId });
    if (cursor) params.set('cursor', cursor);
    if (direction) params.set('direction', direction);

    const response = await fetch(`/api/messages?${params}`);
    return response.json();
  };

  const {
    items: messages,
    containerRef,
    handleScroll: baseHandleScroll,
    isLoadingNext,
    isLoadingPrev,
    scrollToBottom,
  } = useBidirectionalScroll<Message>({
    queryKey: ['messages', channelId],
    fetchPage: fetchMessages,
    threshold: 100,
  });

  const handleScroll = () => {
    baseHandleScroll();

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;

    isAtBottomRef.current = atBottom;
    setShowScrollButton(!atBottom);
  };

  // Auto-scroll to bottom on new messages if user is at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Messages container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4"
      >
        {/* Loading older messages */}
        {isLoadingPrev && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === currentUserId}
            />
          ))}
        </div>

        {/* Loading newer messages */}
        {isLoadingNext && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-medium text-gray-500 mb-1">
            {message.sender.name}
          </p>
        )}
        <p>{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
```

### Timeline Component

```tsx
// components/timeline.tsx
'use client';

import { BidirectionalList } from './bidirectional-list';
import { Calendar, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'milestone' | 'update' | 'comment';
}

interface TimelineProps {
  projectId: string;
}

export function Timeline({ projectId }: TimelineProps) {
  const fetchEvents = async (cursor?: string, direction?: 'next' | 'prev') => {
    const params = new URLSearchParams({ projectId });
    if (cursor) params.set('cursor', cursor);
    if (direction) params.set('direction', direction);

    const response = await fetch(`/api/timeline?${params}`);
    return response.json();
  };

  const renderEvent = (event: TimelineEvent, index: number) => (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline dot */}
      <div
        className={`absolute left-1 top-1 w-5 h-5 rounded-full border-2 border-white ${
          event.type === 'milestone'
            ? 'bg-green-500'
            : event.type === 'update'
            ? 'bg-blue-500'
            : 'bg-gray-400'
        }`}
      />

      {/* Event card */}
      <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              event.type === 'milestone'
                ? 'bg-green-100 text-green-700'
                : event.type === 'update'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {event.type}
          </span>
        </div>
        <p className="text-gray-600 text-sm mt-2">{event.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.timestamp).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(event.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[600px]">
      <BidirectionalList<TimelineEvent>
        queryKey={['timeline', projectId]}
        fetchPage={fetchEvents}
        renderItem={renderEvent}
        getItemKey={(event) => event.id}
        emptyMessage="No events in timeline"
        className="h-full"
      />
    </div>
  );
}
```

### Messages API Route

```tsx
// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock messages data
const messages = Array.from({ length: 100 }, (_, i) => ({
  id: `msg-${i}`,
  content: `Message ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  sender: {
    id: i % 2 === 0 ? 'user-1' : 'user-2',
    name: i % 2 === 0 ? 'Alice' : 'Bob',
  },
  timestamp: new Date(Date.now() - (100 - i) * 60000),
}));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const direction = searchParams.get('direction') || 'next';
  const limit = 20;

  // Simulate delay
  await new Promise((r) => setTimeout(r, 500));

  let startIndex = 0;
  
  if (cursor) {
    const cursorIndex = messages.findIndex((m) => m.id === cursor);
    if (cursorIndex !== -1) {
      startIndex = direction === 'next' ? cursorIndex + 1 : cursorIndex - limit;
    }
  }

  startIndex = Math.max(0, startIndex);
  const endIndex = Math.min(messages.length, startIndex + limit);
  const items = messages.slice(startIndex, endIndex);

  return NextResponse.json({
    items,
    nextCursor: endIndex < messages.length ? messages[endIndex - 1]?.id : null,
    prevCursor: startIndex > 0 ? messages[startIndex]?.id : null,
    hasMore: endIndex < messages.length,
    hasPrevious: startIndex > 0,
  });
}
```

## Usage

```tsx
// app/chat/[channelId]/page.tsx
import { ChatMessages } from '@/components/chat-messages';

interface ChatPageProps {
  params: Promise<{ channelId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { channelId } = await params;
  const currentUserId = 'user-1'; // Get from session

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Chat</h1>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ChatMessages channelId={channelId} currentUserId={currentUserId} />
      </main>
      
      <footer className="p-4 border-t">
        {/* Message input */}
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-4 py-2 border rounded-full"
        />
      </footer>
    </div>
  );
}
```

## Related Skills

- [[virtual-scroll]] - Virtualized lists
- [[react-query]] - Data fetching
- [[websockets]] - Real-time updates
- [[chat]] - Chat implementation

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Bidirectional infinite scroll hook
- Chat messages component
- Timeline component
- Scroll position maintenance
