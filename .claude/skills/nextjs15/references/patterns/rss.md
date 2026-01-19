---
id: pt-rss
name: RSS Subscription
version: 1.0.0
layer: L5
category: content
description: Subscribe to and parse RSS feeds for content aggregation
tags: [content, rss, reader, aggregation, next15, react19]
composes: []
dependencies: []
formula: "RSSSubscription = FeedParser + SubscriptionStore + RefreshScheduler + FeedReader"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# RSS Subscription

## Overview

RSS subscription allows users to follow external content feeds. This pattern covers feed parsing, subscription management, and scheduled refreshes for building RSS readers.

## When to Use

- News aggregators
- Content curation platforms
- Personal RSS readers
- Blog following systems
- Social feed integration

## Feed Schema

```prisma
// prisma/schema.prisma
model Feed {
  id          String   @id @default(cuid())
  url         String   @unique
  title       String
  description String?
  siteUrl     String?
  imageUrl    String?
  lastFetched DateTime?
  errorCount  Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items         FeedItem[]
  subscriptions Subscription[]

  @@map("feeds")
}

model FeedItem {
  id          String    @id @default(cuid())
  guid        String
  title       String
  link        String
  description String?
  content     String?
  author      String?
  pubDate     DateTime?
  imageUrl    String?
  categories  String[]
  createdAt   DateTime  @default(now())

  feedId String
  feed   Feed   @relation(fields: [feedId], references: [id], onDelete: Cascade)

  readStatus ReadStatus[]

  @@unique([feedId, guid])
  @@index([feedId])
  @@index([pubDate])
  @@map("feed_items")
}

model Subscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  feedId    String
  feed      Feed     @relation(fields: [feedId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, feedId])
  @@map("subscriptions")
}

model ReadStatus {
  id         String   @id @default(cuid())
  userId     String
  feedItemId String
  feedItem   FeedItem @relation(fields: [feedItemId], references: [id], onDelete: Cascade)
  readAt     DateTime @default(now())

  @@unique([userId, feedItemId])
  @@map("read_status")
}
```

## RSS Parser

```typescript
// lib/feed/parser.ts
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  image?: string;
  items: ParsedFeedItem[];
}

export interface ParsedFeedItem {
  guid: string;
  title: string;
  link: string;
  description?: string;
  content?: string;
  author?: string;
  pubDate?: Date;
  categories?: string[];
  imageUrl?: string;
}

export async function parseFeed(url: string): Promise<ParsedFeed> {
  try {
    const feed = await parser.parseURL(url);

    return {
      title: feed.title || 'Untitled Feed',
      description: feed.description,
      link: feed.link,
      image: feed.image?.url,
      items: feed.items.map((item) => ({
        guid: item.guid || item.link || item.title || '',
        title: item.title || 'Untitled',
        link: item.link || '',
        description: item.contentSnippet || item.summary,
        content: (item as any).contentEncoded || item.content,
        author: item.creator || item.author,
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        categories: item.categories,
        imageUrl:
          (item as any).mediaContent?.['$']?.url ||
          extractImageFromContent(item.content || ''),
      })),
    };
  } catch (error) {
    throw new Error(`Failed to parse feed: ${(error as Error).message}`);
  }
}

function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1];
}
```

## Feed Service

```typescript
// lib/services/feeds.ts
import { prisma } from '@/lib/db';
import { parseFeed } from '@/lib/feed/parser';

export async function subscribeFeed(userId: string, feedUrl: string) {
  // Check if feed already exists
  let feed = await prisma.feed.findUnique({
    where: { url: feedUrl },
  });

  if (!feed) {
    // Parse and create new feed
    const parsed = await parseFeed(feedUrl);

    feed = await prisma.feed.create({
      data: {
        url: feedUrl,
        title: parsed.title,
        description: parsed.description,
        siteUrl: parsed.link,
        imageUrl: parsed.image,
        lastFetched: new Date(),
        items: {
          create: parsed.items.map((item) => ({
            guid: item.guid,
            title: item.title,
            link: item.link,
            description: item.description,
            content: item.content,
            author: item.author,
            pubDate: item.pubDate,
            categories: item.categories || [],
            imageUrl: item.imageUrl,
          })),
        },
      },
    });
  }

  // Create subscription
  await prisma.subscription.upsert({
    where: { userId_feedId: { userId, feedId: feed.id } },
    create: { userId, feedId: feed.id },
    update: {},
  });

  return feed;
}

export async function refreshFeed(feedId: string) {
  const feed = await prisma.feed.findUnique({
    where: { id: feedId },
  });

  if (!feed) throw new Error('Feed not found');

  try {
    const parsed = await parseFeed(feed.url);

    // Upsert items
    for (const item of parsed.items) {
      await prisma.feedItem.upsert({
        where: { feedId_guid: { feedId, guid: item.guid } },
        create: {
          feedId,
          guid: item.guid,
          title: item.title,
          link: item.link,
          description: item.description,
          content: item.content,
          author: item.author,
          pubDate: item.pubDate,
          categories: item.categories || [],
          imageUrl: item.imageUrl,
        },
        update: {
          title: item.title,
          description: item.description,
          content: item.content,
        },
      });
    }

    await prisma.feed.update({
      where: { id: feedId },
      data: { lastFetched: new Date(), errorCount: 0 },
    });
  } catch (error) {
    await prisma.feed.update({
      where: { id: feedId },
      data: { errorCount: { increment: 1 } },
    });
    throw error;
  }
}

export async function getUserFeedItems(
  userId: string,
  options: { feedId?: string; unreadOnly?: boolean; limit?: number; cursor?: string }
) {
  const { feedId, unreadOnly, limit = 50, cursor } = options;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId, ...(feedId && { feedId }) },
    select: { feedId: true },
  });

  const feedIds = subscriptions.map((s) => s.feedId);

  const items = await prisma.feedItem.findMany({
    where: {
      feedId: { in: feedIds },
      ...(cursor && { id: { lt: cursor } }),
      ...(unreadOnly && {
        NOT: { readStatus: { some: { userId } } },
      }),
    },
    orderBy: { pubDate: 'desc' },
    take: limit + 1,
    include: {
      feed: { select: { title: true, imageUrl: true } },
      readStatus: { where: { userId }, select: { readAt: true } },
    },
  });

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, -1) : items;

  return {
    items: results.map((item) => ({
      ...item,
      isRead: item.readStatus.length > 0,
    })),
    nextCursor: hasMore ? results[results.length - 1].id : null,
  };
}

export async function markAsRead(userId: string, itemId: string) {
  await prisma.readStatus.upsert({
    where: { userId_feedItemId: { userId, feedItemId: itemId } },
    create: { userId, feedItemId: itemId },
    update: { readAt: new Date() },
  });
}
```

## Feed Refresh Cron

```typescript
// app/api/cron/refresh-feeds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { refreshFeed } from '@/lib/services/feeds';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const feeds = await prisma.feed.findMany({
    where: {
      active: true,
      errorCount: { lt: 5 },
      OR: [
        { lastFetched: null },
        { lastFetched: { lt: new Date(Date.now() - 15 * 60 * 1000) } }, // 15 min ago
      ],
    },
    take: 50,
  });

  const results = await Promise.allSettled(
    feeds.map((feed) => refreshFeed(feed.id))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ succeeded, failed, total: feeds.length });
}
```

## Feed Reader Component

```typescript
// components/feed-reader.tsx
'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Check } from 'lucide-react';

interface FeedItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  isRead: boolean;
  feed: { title: string; imageUrl?: string };
}

export function FeedReader() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed-items', filter],
    queryFn: ({ pageParam }) =>
      fetch(`/api/feeds/items?cursor=${pageParam || ''}&unreadOnly=${filter === 'unread'}`)
        .then((r) => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: '',
  });

  const markRead = useMutation({
    mutationFn: (itemId: string) =>
      fetch(`/api/feeds/items/${itemId}/read`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-items'] });
    },
  });

  const items = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Unread
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item: FeedItem) => (
          <Card key={item.id} className={item.isRead ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {item.feed.title}
                  </Badge>
                  <CardTitle className="text-lg">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      onClick={() => !item.isRead && markRead.mutate(item.id)}
                    >
                      {item.title}
                      <ExternalLink className="inline ml-2 h-4 w-4" />
                    </a>
                  </CardTitle>
                </div>
                {!item.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markRead.mutate(item.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.pubDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} variant="outline" className="w-full">
          Load More
        </Button>
      )}
    </div>
  );
}
```

## Anti-patterns

### Don't Fetch Feeds Synchronously

```typescript
// BAD - Blocking user request
const feed = await parseFeed(url); // Slow external request
return NextResponse.json(feed);

// GOOD - Queue for background processing
await queue.add('fetch-feed', { url });
return NextResponse.json({ status: 'processing' });
```

## Related Skills

- [rss-feed](./rss-feed.md)
- [infinite-scroll](./infinite-scroll.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Feed parsing
- Subscription management
- Background refresh
