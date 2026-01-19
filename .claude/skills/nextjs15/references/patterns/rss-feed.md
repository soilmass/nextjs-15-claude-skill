---
id: pt-rss-feed
name: RSS Feed Generation
version: 1.1.0
layer: L5
category: content
description: Generate RSS/Atom feeds for blog posts and content updates
tags: [content, rss, atom, feed, next15, react19]
composes: []
dependencies: []
formula: "RSSFeed = XMLBuilder + FeedMetadata + ContentItems + RouteHandler"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# RSS Feed Generation

## Overview

RSS (Really Simple Syndication) feeds are a standardized XML-based format that allows users to subscribe to content updates from websites using feed readers. This pattern enables content publishers to syndicate their content to a broad audience without requiring users to manually check for updates. RSS feeds are essential for blogs, news sites, podcasts, and any platform with regularly updated content.

In Next.js 15, RSS feeds are implemented as Route Handlers that generate XML responses. The App Router's support for static generation with revalidation makes it ideal for feed generation, as feeds can be pre-rendered and cached while still staying up-to-date with new content. This approach provides excellent performance while ensuring feed readers always receive current content.

This pattern covers multiple feed formats including RSS 2.0, Atom 1.0, and JSON Feed 1.1. Each format has its advantages: RSS 2.0 is the most widely supported, Atom provides more precise semantics and internationalization support, and JSON Feed offers a modern alternative that is easier to parse and debug. Implementing all three formats ensures maximum compatibility with different feed readers and aggregators.

## When to Use

- **Blog platforms** - Syndicate articles to readers who prefer consuming content through RSS readers like Feedly, Inoreader, or NetNewsWire
- **News websites** - Distribute breaking news and updates to aggregators and subscribers in real-time
- **Podcast feeds** - Generate podcast RSS feeds compatible with Apple Podcasts, Spotify, and other podcast platforms
- **Content aggregators** - Provide machine-readable content for third-party services to consume and display
- **Changelog pages** - Keep users informed about product updates, release notes, and feature announcements
- **E-commerce product feeds** - Syndicate new products, price changes, and inventory updates for shopping aggregators

## When NOT to Use

- **Frequently changing data** - Feeds are not suitable for real-time data that changes every few seconds; use WebSockets or Server-Sent Events instead
- **Personalized content** - RSS feeds are public and cannot easily deliver user-specific content; consider email newsletters or authenticated APIs
- **Large media files** - Embedding large images or videos directly in feeds causes slow load times; use enclosures with external URLs instead
- **Interactive content** - RSS feeds are static XML; interactive features like forms, comments, or live widgets cannot be included

## Composition Diagram

```
+------------------------------------------------------------------+
|                        RSS Feed System                            |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------+      +---------------------------+          |
|  |   Feed Routes     |      |     Content Sources       |          |
|  |-------------------|      |---------------------------|          |
|  | /feed.xml (RSS)   |<---->| Database (Prisma)         |          |
|  | /feed.atom (Atom) |      | CMS (Headless)            |          |
|  | /feed.json (JSON) |      | Static Files (MDX)        |          |
|  +-------------------+      | External APIs             |          |
|           |                 +---------------------------+          |
|           v                                                        |
|  +-------------------+      +---------------------------+          |
|  |   Feed Generators |      |     Caching Strategy      |          |
|  |-------------------|      |---------------------------|          |
|  | generateRSSFeed() |      | Static Generation         |          |
|  | generateAtomFeed()|----->| ISR (revalidate: 3600)    |          |
|  | generateJSONFeed()|      | CDN Cache Headers         |          |
|  +-------------------+      | Edge Caching              |          |
|           |                 +---------------------------+          |
|           v                                                        |
|  +-------------------+      +---------------------------+          |
|  |   XML Response    |      |     Feed Consumers        |          |
|  |-------------------|      |---------------------------|          |
|  | Content-Type XML  |----->| RSS Readers (Feedly)      |          |
|  | Cache-Control     |      | Podcast Apps              |          |
|  | UTF-8 Encoding    |      | Aggregators               |          |
|  +-------------------+      | SEO Crawlers              |          |
|                             +---------------------------+          |
+------------------------------------------------------------------+

Feed Discovery Flow:
+------------------------------------------------------------------+
|                                                                    |
|  HTML Page                                                         |
|  +------------------------------------------------------------+   |
|  | <head>                                                      |   |
|  |   <link rel="alternate" type="application/rss+xml"          |   |
|  |         href="/feed.xml" title="RSS Feed" />                |   |
|  |   <link rel="alternate" type="application/atom+xml"         |   |
|  |         href="/feed.atom" title="Atom Feed" />              |   |
|  | </head>                                                     |   |
|  +------------------------------------------------------------+   |
|                          |                                         |
|                          v                                         |
|  Feed Reader Auto-Discovery                                        |
|  +------------------------------------------------------------+   |
|  | 1. User pastes website URL                                  |   |
|  | 2. Reader fetches HTML, parses <link> tags                  |   |
|  | 3. Reader finds feed URLs and offers subscription           |   |
|  | 4. User subscribes, reader polls feed periodically          |   |
|  +------------------------------------------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
```

## RSS Route Handler

```typescript
// app/feed.xml/route.ts
import { prisma } from '@/lib/db';
import { generateRSSFeed } from '@/lib/feed/rss';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      author: { select: { name: true, email: true } },
      tags: true,
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const feed = generateRSSFeed({
    title: 'My Blog',
    description: 'Latest posts from my blog',
    siteUrl,
    feedUrl: `${siteUrl}/feed.xml`,
    language: 'en',
    copyright: `Copyright ${new Date().getFullYear()} My Blog`,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || post.content.slice(0, 200),
      content: post.content,
      link: `${siteUrl}/posts/${post.slug}`,
      guid: post.id,
      pubDate: post.publishedAt!,
      author: post.author.name || undefined,
      categories: post.tags.map((t) => t.name),
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

## RSS Generator

```typescript
// lib/feed/rss.ts
interface FeedItem {
  title: string;
  description: string;
  content?: string;
  link: string;
  guid: string;
  pubDate: Date;
  author?: string;
  categories?: string[];
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

interface FeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  ttl?: number;
  image?: {
    url: string;
    title: string;
    link: string;
  };
  items: FeedItem[];
}

export function generateRSSFeed(options: FeedOptions): string {
  const {
    title,
    description,
    siteUrl,
    feedUrl,
    language = 'en',
    copyright,
    ttl = 60,
    image,
    items,
  } = options;

  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const formatDate = (date: Date): string => date.toUTCString();

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description><![CDATA[${item.description}]]></description>
      ${item.content ? `<content:encoded><![CDATA[${item.content}]]></content:encoded>` : ''}
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <pubDate>${formatDate(item.pubDate)}</pubDate>
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
      ${item.categories?.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ') || ''}
      ${
        item.enclosure
          ? `<enclosure url="${escapeXml(item.enclosure.url)}" type="${item.enclosure.type}" length="${item.enclosure.length}" />`
          : ''
      }
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    ${copyright ? `<copyright>${escapeXml(copyright)}</copyright>` : ''}
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <ttl>${ttl}</ttl>
    ${
      image
        ? `
    <image>
      <url>${escapeXml(image.url)}</url>
      <title>${escapeXml(image.title)}</title>
      <link>${escapeXml(image.link)}</link>
    </image>`
        : ''
    }
    ${itemsXml}
  </channel>
</rss>`;
}
```

## Atom Feed Generator

```typescript
// lib/feed/atom.ts
interface AtomEntry {
  id: string;
  title: string;
  summary: string;
  content?: string;
  link: string;
  published: Date;
  updated: Date;
  author: { name: string; email?: string };
  categories?: string[];
}

interface AtomFeedOptions {
  id: string;
  title: string;
  subtitle?: string;
  link: string;
  updated: Date;
  author: { name: string; email?: string };
  entries: AtomEntry[];
}

export function generateAtomFeed(options: AtomFeedOptions): string {
  const { id, title, subtitle, link, updated, author, entries } = options;

  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const formatDate = (date: Date): string => date.toISOString();

  const entriesXml = entries
    .map(
      (entry) => `
  <entry>
    <id>${escapeXml(entry.id)}</id>
    <title>${escapeXml(entry.title)}</title>
    <summary type="html"><![CDATA[${entry.summary}]]></summary>
    ${entry.content ? `<content type="html"><![CDATA[${entry.content}]]></content>` : ''}
    <link href="${escapeXml(entry.link)}" />
    <published>${formatDate(entry.published)}</published>
    <updated>${formatDate(entry.updated)}</updated>
    <author>
      <name>${escapeXml(entry.author.name)}</name>
      ${entry.author.email ? `<email>${escapeXml(entry.author.email)}</email>` : ''}
    </author>
    ${entry.categories?.map((cat) => `<category term="${escapeXml(cat)}" />`).join('\n    ') || ''}
  </entry>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(id)}</id>
  <title>${escapeXml(title)}</title>
  ${subtitle ? `<subtitle>${escapeXml(subtitle)}</subtitle>` : ''}
  <link href="${escapeXml(link)}" />
  <link href="${escapeXml(link)}/feed.atom" rel="self" type="application/atom+xml" />
  <updated>${formatDate(updated)}</updated>
  <author>
    <name>${escapeXml(author.name)}</name>
    ${author.email ? `<email>${escapeXml(author.email)}</email>` : ''}
  </author>
  ${entriesXml}
</feed>`;
}

// app/feed.atom/route.ts
import { generateAtomFeed } from '@/lib/feed/atom';

export async function GET() {
  const posts = await getPosts();

  const feed = generateAtomFeed({
    id: 'https://example.com/',
    title: 'My Blog',
    subtitle: 'Latest posts',
    link: 'https://example.com',
    updated: posts[0]?.updatedAt || new Date(),
    author: { name: 'Blog Author' },
    entries: posts.map((post) => ({
      id: `https://example.com/posts/${post.slug}`,
      title: post.title,
      summary: post.excerpt || '',
      content: post.content,
      link: `https://example.com/posts/${post.slug}`,
      published: post.publishedAt,
      updated: post.updatedAt,
      author: { name: post.author.name },
      categories: post.tags.map((t) => t.name),
    })),
  });

  return new Response(feed, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
```

## JSON Feed

```typescript
// app/feed.json/route.ts
import { prisma } from '@/lib/db';

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { author: true, tags: true },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'My Blog',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: 'Latest posts from my blog',
    language: 'en',
    items: posts.map((post) => ({
      id: post.id,
      url: `${siteUrl}/posts/${post.slug}`,
      title: post.title,
      content_html: post.content,
      summary: post.excerpt,
      date_published: post.publishedAt?.toISOString(),
      date_modified: post.updatedAt.toISOString(),
      authors: [{ name: post.author.name }],
      tags: post.tags.map((t) => t.name),
    })),
  };

  return Response.json(feed, {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
```

## Podcast Feed Generator

```typescript
// lib/feed/podcast.ts
interface PodcastEpisode {
  title: string;
  description: string;
  audioUrl: string;
  audioType: string;
  audioSize: number;
  duration: number; // seconds
  pubDate: Date;
  guid: string;
  season?: number;
  episode?: number;
  explicit?: boolean;
  image?: string;
}

interface PodcastFeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  author: string;
  email: string;
  image: string;
  language?: string;
  category: string;
  subcategory?: string;
  explicit?: boolean;
  episodes: PodcastEpisode[];
}

export function generatePodcastFeed(options: PodcastFeedOptions): string {
  const {
    title,
    description,
    siteUrl,
    feedUrl,
    author,
    email,
    image,
    language = 'en',
    category,
    subcategory,
    explicit = false,
    episodes,
  } = options;

  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const episodesXml = episodes
    .map(
      (ep) => `
    <item>
      <title>${escapeXml(ep.title)}</title>
      <description><![CDATA[${ep.description}]]></description>
      <enclosure url="${escapeXml(ep.audioUrl)}" type="${ep.audioType}" length="${ep.audioSize}" />
      <guid isPermaLink="false">${escapeXml(ep.guid)}</guid>
      <pubDate>${ep.pubDate.toUTCString()}</pubDate>
      <itunes:duration>${formatDuration(ep.duration)}</itunes:duration>
      <itunes:explicit>${ep.explicit ? 'yes' : 'no'}</itunes:explicit>
      ${ep.season ? `<itunes:season>${ep.season}</itunes:season>` : ''}
      ${ep.episode ? `<itunes:episode>${ep.episode}</itunes:episode>` : ''}
      ${ep.image ? `<itunes:image href="${escapeXml(ep.image)}" />` : ''}
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <description><![CDATA[${description}]]></description>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <itunes:author>${escapeXml(author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escapeXml(author)}</itunes:name>
      <itunes:email>${escapeXml(email)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(image)}" />
    <itunes:category text="${escapeXml(category)}">
      ${subcategory ? `<itunes:category text="${escapeXml(subcategory)}" />` : ''}
    </itunes:category>
    <itunes:explicit>${explicit ? 'yes' : 'no'}</itunes:explicit>
    ${episodesXml}
  </channel>
</rss>`;
}

// app/podcast.xml/route.ts
import { prisma } from '@/lib/db';
import { generatePodcastFeed } from '@/lib/feed/podcast';

export const revalidate = 3600;

export async function GET() {
  const episodes = await prisma.episode.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const feed = generatePodcastFeed({
    title: 'My Podcast',
    description: 'Weekly discussions about technology and development',
    siteUrl,
    feedUrl: `${siteUrl}/podcast.xml`,
    author: 'Podcast Host',
    email: 'podcast@example.com',
    image: `${siteUrl}/podcast-cover.jpg`,
    category: 'Technology',
    subcategory: 'Software How-To',
    episodes: episodes.map((ep) => ({
      title: ep.title,
      description: ep.description,
      audioUrl: ep.audioUrl,
      audioType: 'audio/mpeg',
      audioSize: ep.audioSize,
      duration: ep.duration,
      pubDate: ep.publishedAt!,
      guid: ep.id,
      season: ep.season,
      episode: ep.episodeNumber,
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

## Category-Specific Feeds

```typescript
// app/feed/[category]/route.ts
import { prisma } from '@/lib/db';
import { generateRSSFeed } from '@/lib/feed/rss';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  const categoryData = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryData) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categoryId: categoryData.id,
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      author: { select: { name: true } },
      tags: true,
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const feed = generateRSSFeed({
    title: `${categoryData.name} - My Blog`,
    description: `Latest ${categoryData.name} posts`,
    siteUrl,
    feedUrl: `${siteUrl}/feed/${category}`,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || '',
      link: `${siteUrl}/posts/${post.slug}`,
      guid: post.id,
      pubDate: post.publishedAt!,
      author: post.author.name || undefined,
      categories: post.tags.map((t) => t.name),
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

## Feed Discovery Meta Tags

```typescript
// app/layout.tsx
export const metadata = {
  alternates: {
    types: {
      'application/rss+xml': 'https://example.com/feed.xml',
      'application/atom+xml': 'https://example.com/feed.atom',
      'application/feed+json': 'https://example.com/feed.json',
    },
  },
};
```

## Feed Service with Caching

```typescript
// lib/feed/service.ts
import { prisma } from '@/lib/db';
import { unstable_cache } from 'next/cache';

interface PostForFeed {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  publishedAt: Date;
  updatedAt: Date;
  author: { name: string | null; email: string | null };
  tags: { name: string }[];
}

export const getFeedPosts = unstable_cache(
  async (limit: number = 20): Promise<PostForFeed[]> => {
    return prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { name: true, email: true } },
        tags: { select: { name: true } },
      },
    });
  },
  ['feed-posts'],
  { revalidate: 3600, tags: ['posts'] }
);

export const getCategoryFeedPosts = unstable_cache(
  async (categorySlug: string, limit: number = 20): Promise<PostForFeed[]> => {
    return prisma.post.findMany({
      where: {
        published: true,
        category: { slug: categorySlug },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { name: true, email: true } },
        tags: { select: { name: true } },
      },
    });
  },
  ['category-feed-posts'],
  { revalidate: 3600, tags: ['posts'] }
);

export const getAuthorFeedPosts = unstable_cache(
  async (authorId: string, limit: number = 20): Promise<PostForFeed[]> => {
    return prisma.post.findMany({
      where: {
        published: true,
        authorId,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { name: true, email: true } },
        tags: { select: { name: true } },
      },
    });
  },
  ['author-feed-posts'],
  { revalidate: 3600, tags: ['posts'] }
);
```

## Examples

### Example 1: Multi-Format Blog Feed

```typescript
// app/blog/feed/route.ts
import { getFeedPosts } from '@/lib/feed/service';
import { generateRSSFeed } from '@/lib/feed/rss';
import { generateAtomFeed } from '@/lib/feed/atom';

export const revalidate = 1800; // 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'rss';

  const posts = await getFeedPosts(50);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (format === 'atom') {
    const feed = generateAtomFeed({
      id: `${siteUrl}/blog`,
      title: 'Tech Blog',
      subtitle: 'Insights on software development',
      link: siteUrl,
      updated: posts[0]?.updatedAt || new Date(),
      author: { name: 'Tech Blog Team' },
      entries: posts.map((post) => ({
        id: `${siteUrl}/blog/${post.slug}`,
        title: post.title,
        summary: post.excerpt || '',
        content: post.content,
        link: `${siteUrl}/blog/${post.slug}`,
        published: post.publishedAt,
        updated: post.updatedAt,
        author: { name: post.author.name || 'Anonymous' },
        categories: post.tags.map((t) => t.name),
      })),
    });

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      },
    });
  }

  const feed = generateRSSFeed({
    title: 'Tech Blog',
    description: 'Insights on software development',
    siteUrl,
    feedUrl: `${siteUrl}/blog/feed`,
    language: 'en',
    copyright: `Copyright ${new Date().getFullYear()} Tech Blog`,
    image: {
      url: `${siteUrl}/logo.png`,
      title: 'Tech Blog',
      link: siteUrl,
    },
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || post.content.slice(0, 300),
      content: post.content,
      link: `${siteUrl}/blog/${post.slug}`,
      guid: post.id,
      pubDate: post.publishedAt,
      author: post.author.name || undefined,
      categories: post.tags.map((t) => t.name),
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
    },
  });
}
```

### Example 2: Product Changelog Feed

```typescript
// lib/feed/changelog.ts
interface ChangelogEntry {
  version: string;
  date: Date;
  title: string;
  description: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'breaking';
    description: string;
  }[];
}

export function generateChangelogRSS(
  entries: ChangelogEntry[],
  options: { title: string; siteUrl: string }
): string {
  const escapeXml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const changeTypeEmoji: Record<string, string> = {
    feature: '[NEW]',
    improvement: '[IMPROVED]',
    fix: '[FIXED]',
    breaking: '[BREAKING]',
  };

  const itemsXml = entries
    .map((entry) => {
      const changesHtml = entry.changes
        .map((c) => `<li>${changeTypeEmoji[c.type]} ${c.description}</li>`)
        .join('\n');

      return `
    <item>
      <title>v${entry.version} - ${escapeXml(entry.title)}</title>
      <description><![CDATA[
        <p>${entry.description}</p>
        <ul>${changesHtml}</ul>
      ]]></description>
      <link>${options.siteUrl}/changelog#v${entry.version}</link>
      <guid isPermaLink="false">changelog-v${entry.version}</guid>
      <pubDate>${entry.date.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(options.title)} Changelog</title>
    <description>Release notes and updates</description>
    <link>${options.siteUrl}/changelog</link>
    <atom:link href="${options.siteUrl}/changelog.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;
}

// app/changelog.xml/route.ts
import { prisma } from '@/lib/db';
import { generateChangelogRSS } from '@/lib/feed/changelog';

export const revalidate = 86400; // Daily

export async function GET() {
  const releases = await prisma.release.findMany({
    orderBy: { releaseDate: 'desc' },
    take: 50,
    include: {
      changes: true,
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const feed = generateChangelogRSS(
    releases.map((r) => ({
      version: r.version,
      date: r.releaseDate,
      title: r.title,
      description: r.description,
      changes: r.changes.map((c) => ({
        type: c.type as 'feature' | 'improvement' | 'fix' | 'breaking',
        description: c.description,
      })),
    })),
    { title: 'MyApp', siteUrl }
  );

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
```

### Example 3: News Aggregator with Multiple Sources

```typescript
// lib/feed/aggregator.ts
interface AggregatedItem {
  source: string;
  sourceUrl: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  categories: string[];
}

export async function aggregateFeeds(
  sources: { name: string; url: string; feedUrl: string }[]
): Promise<AggregatedItem[]> {
  const items: AggregatedItem[] = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.feedUrl, {
        next: { revalidate: 1800 },
      });
      const xml = await response.text();
      const parsedItems = parseRSSFeed(xml);

      items.push(
        ...parsedItems.map((item) => ({
          source: source.name,
          sourceUrl: source.url,
          ...item,
        }))
      );
    } catch (error) {
      console.error(`Failed to fetch feed from ${source.name}:`, error);
    }
  }

  // Sort by date, newest first
  return items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

function parseRSSFeed(xml: string): Omit<AggregatedItem, 'source' | 'sourceUrl'>[] {
  // Simple XML parsing (in production, use a proper XML parser)
  const items: Omit<AggregatedItem, 'source' | 'sourceUrl'>[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const itemXml = match[1];
    const title = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || '';
    const description = itemXml.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)?.[1] || '';
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDateStr = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    const categoryMatches = itemXml.matchAll(/<category>(.*?)<\/category>/g);

    items.push({
      title,
      description,
      link,
      pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
      categories: Array.from(categoryMatches).map((m) => m[1]),
    });
  }

  return items;
}

// app/aggregated-feed.xml/route.ts
import { aggregateFeeds } from '@/lib/feed/aggregator';
import { generateRSSFeed } from '@/lib/feed/rss';

export const revalidate = 1800;

const NEWS_SOURCES = [
  { name: 'Tech News', url: 'https://technews.example.com', feedUrl: 'https://technews.example.com/feed.xml' },
  { name: 'Dev Blog', url: 'https://devblog.example.com', feedUrl: 'https://devblog.example.com/rss' },
];

export async function GET() {
  const items = await aggregateFeeds(NEWS_SOURCES);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const feed = generateRSSFeed({
    title: 'Aggregated News Feed',
    description: 'Combined news from multiple sources',
    siteUrl,
    feedUrl: `${siteUrl}/aggregated-feed.xml`,
    items: items.slice(0, 50).map((item) => ({
      title: `[${item.source}] ${item.title}`,
      description: item.description,
      link: item.link,
      guid: item.link,
      pubDate: item.pubDate,
      categories: [...item.categories, item.source],
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
```

## Anti-patterns

### 1. No Caching - Regenerating Feed on Every Request

```typescript
// BAD - Heavy database query on every request
export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { author: true, tags: true },
  });

  const feed = generateRSSFeed({
    title: 'My Blog',
    siteUrl: 'https://example.com',
    feedUrl: 'https://example.com/feed.xml',
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || '',
      link: `https://example.com/posts/${post.slug}`,
      guid: post.id,
      pubDate: post.publishedAt!,
    })),
  });

  return new Response(feed); // No caching!
}

// GOOD - Static generation with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { author: true, tags: true },
  });

  const feed = generateRSSFeed({
    title: 'My Blog',
    siteUrl: 'https://example.com',
    feedUrl: 'https://example.com/feed.xml',
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt || '',
      link: `https://example.com/posts/${post.slug}`,
      guid: post.id,
      pubDate: post.publishedAt!,
    })),
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

### 2. Missing XML Escaping - XSS Vulnerabilities

```typescript
// BAD - No XML escaping, vulnerable to injection
function generateFeedItem(item: { title: string; link: string }) {
  return `
    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
    </item>
  `;
}

// If title contains: "Breaking News <script>alert('XSS')</script>"
// This creates invalid XML and potential security issues

// GOOD - Proper XML escaping
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateFeedItem(item: { title: string; link: string }) {
  return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
    </item>
  `;
}
```

### 3. Incorrect Content-Type Header

```typescript
// BAD - Using text/plain or text/html
export async function GET() {
  const feed = generateRSSFeed(options);
  return new Response(feed, {
    headers: {
      'Content-Type': 'text/plain', // Feed readers may not recognize this
    },
  });
}

// GOOD - Proper MIME types for feeds
export async function GET() {
  const feed = generateRSSFeed(options);
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8', // For RSS
      // Or: 'application/atom+xml; charset=utf-8' for Atom
      // Or: 'application/feed+json; charset=utf-8' for JSON Feed
    },
  });
}
```

### 4. Including Full Content Without Truncation

```typescript
// BAD - Including entire article content makes feed huge
function generateFeedItem(post: Post) {
  return {
    title: post.title,
    description: post.content, // Full 10,000 word article!
    content: post.content,     // Duplicated again!
    link: `https://example.com/posts/${post.slug}`,
    guid: post.id,
    pubDate: post.publishedAt,
  };
}

// GOOD - Use excerpt for description, full content in content:encoded
function generateFeedItem(post: Post) {
  return {
    title: post.title,
    description: post.excerpt || truncateText(post.content, 300),
    content: post.content, // Only in content:encoded, optional
    link: `https://example.com/posts/${post.slug}`,
    guid: post.id,
    pubDate: post.publishedAt,
  };
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
```

### 5. Missing Feed Discovery Links

```typescript
// BAD - No feed discovery, users must manually find feed URL
// app/layout.tsx
export const metadata = {
  title: 'My Blog',
  description: 'A great blog',
  // No alternates specified!
};

// GOOD - Proper feed discovery meta tags
// app/layout.tsx
export const metadata = {
  title: 'My Blog',
  description: 'A great blog',
  alternates: {
    types: {
      'application/rss+xml': [
        { url: 'https://example.com/feed.xml', title: 'RSS Feed' },
      ],
      'application/atom+xml': [
        { url: 'https://example.com/feed.atom', title: 'Atom Feed' },
      ],
    },
  },
};
```

## Testing

### Unit Tests for Feed Generators

```typescript
// __tests__/lib/feed/rss.test.ts
import { generateRSSFeed } from '@/lib/feed/rss';

describe('generateRSSFeed', () => {
  const baseOptions = {
    title: 'Test Blog',
    description: 'A test blog',
    siteUrl: 'https://example.com',
    feedUrl: 'https://example.com/feed.xml',
    items: [],
  };

  it('generates valid RSS 2.0 XML', () => {
    const feed = generateRSSFeed(baseOptions);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain('<channel>');
    expect(feed).toContain('<title>Test Blog</title>');
  });

  it('includes atom:link for self-reference', () => {
    const feed = generateRSSFeed(baseOptions);

    expect(feed).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(feed).toContain(
      '<atom:link href="https://example.com/feed.xml" rel="self" type="application/rss+xml" />'
    );
  });

  it('generates items with required fields', () => {
    const feed = generateRSSFeed({
      ...baseOptions,
      items: [
        {
          title: 'Test Post',
          description: 'Test description',
          link: 'https://example.com/posts/test',
          guid: 'post-123',
          pubDate: new Date('2024-01-15T10:00:00Z'),
        },
      ],
    });

    expect(feed).toContain('<item>');
    expect(feed).toContain('<title>Test Post</title>');
    expect(feed).toContain('<guid isPermaLink="false">post-123</guid>');
    expect(feed).toContain('<pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>');
  });

  it('escapes XML special characters', () => {
    const feed = generateRSSFeed({
      ...baseOptions,
      title: 'Blog & News <Daily>',
      items: [
        {
          title: 'Post "with" <special> & characters',
          description: 'Safe content',
          link: 'https://example.com/post',
          guid: 'p1',
          pubDate: new Date(),
        },
      ],
    });

    expect(feed).toContain('Blog &amp; News &lt;Daily&gt;');
    expect(feed).toContain('Post &quot;with&quot; &lt;special&gt; &amp; characters');
  });

  it('includes optional fields when provided', () => {
    const feed = generateRSSFeed({
      ...baseOptions,
      language: 'en-US',
      copyright: 'Copyright 2024',
      ttl: 120,
      image: {
        url: 'https://example.com/logo.png',
        title: 'Blog Logo',
        link: 'https://example.com',
      },
      items: [],
    });

    expect(feed).toContain('<language>en-US</language>');
    expect(feed).toContain('<copyright>Copyright 2024</copyright>');
    expect(feed).toContain('<ttl>120</ttl>');
    expect(feed).toContain('<image>');
    expect(feed).toContain('<url>https://example.com/logo.png</url>');
  });

  it('includes enclosure for podcast/media items', () => {
    const feed = generateRSSFeed({
      ...baseOptions,
      items: [
        {
          title: 'Episode 1',
          description: 'First episode',
          link: 'https://example.com/ep1',
          guid: 'ep-1',
          pubDate: new Date(),
          enclosure: {
            url: 'https://example.com/audio/ep1.mp3',
            type: 'audio/mpeg',
            length: 52428800,
          },
        },
      ],
    });

    expect(feed).toContain(
      '<enclosure url="https://example.com/audio/ep1.mp3" type="audio/mpeg" length="52428800" />'
    );
  });
});
```

### Integration Tests for Feed Routes

```typescript
// __tests__/app/feed.test.ts
import { GET as getRSSFeed } from '@/app/feed.xml/route';
import { GET as getAtomFeed } from '@/app/feed.atom/route';
import { GET as getJSONFeed } from '@/app/feed.json/route';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
    },
  },
}));

const mockPosts = [
  {
    id: 'post-1',
    title: 'First Post',
    slug: 'first-post',
    excerpt: 'This is the first post',
    content: '<p>Full content of the first post</p>',
    published: true,
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    author: { name: 'John Doe', email: 'john@example.com' },
    tags: [{ name: 'tech' }, { name: 'tutorial' }],
  },
  {
    id: 'post-2',
    title: 'Second Post',
    slug: 'second-post',
    excerpt: 'This is the second post',
    content: '<p>Full content of the second post</p>',
    published: true,
    publishedAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17'),
    author: { name: 'Jane Smith', email: 'jane@example.com' },
    tags: [{ name: 'news' }],
  },
];

describe('RSS Feed Route', () => {
  beforeEach(() => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
  });

  it('returns RSS XML with correct content type', async () => {
    const response = await getRSSFeed();

    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
  });

  it('includes cache control headers', async () => {
    const response = await getRSSFeed();

    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
  });

  it('returns valid RSS with posts', async () => {
    const response = await getRSSFeed();
    const xml = await response.text();

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>First Post</title>');
    expect(xml).toContain('<title>Second Post</title>');
  });
});

describe('Atom Feed Route', () => {
  beforeEach(() => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
  });

  it('returns Atom XML with correct content type', async () => {
    const response = await getAtomFeed();

    expect(response.headers.get('Content-Type')).toBe('application/atom+xml; charset=utf-8');
  });

  it('returns valid Atom feed', async () => {
    const response = await getAtomFeed();
    const xml = await response.text();

    expect(xml).toContain('xmlns="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('<entry>');
    expect(xml).toContain('<published>');
    expect(xml).toContain('<updated>');
  });
});

describe('JSON Feed Route', () => {
  beforeEach(() => {
    (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
  });

  it('returns JSON with correct content type', async () => {
    const response = await getJSONFeed();

    expect(response.headers.get('Content-Type')).toBe('application/feed+json; charset=utf-8');
  });

  it('returns valid JSON Feed format', async () => {
    const response = await getJSONFeed();
    const feed = await response.json();

    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.items).toHaveLength(2);
    expect(feed.items[0].title).toBe('First Post');
    expect(feed.items[0].authors).toEqual([{ name: 'John Doe' }]);
  });
});
```

### Feed Validation Tests

```typescript
// __tests__/lib/feed/validation.test.ts
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { generateRSSFeed } from '@/lib/feed/rss';
import { generateAtomFeed } from '@/lib/feed/atom';

describe('Feed XML Validation', () => {
  it('generates well-formed RSS XML', () => {
    const feed = generateRSSFeed({
      title: 'Test',
      description: 'Test blog',
      siteUrl: 'https://example.com',
      feedUrl: 'https://example.com/feed.xml',
      items: [
        {
          title: 'Post',
          description: 'Description',
          link: 'https://example.com/post',
          guid: 'p1',
          pubDate: new Date(),
        },
      ],
    });

    const result = XMLValidator.validate(feed);
    expect(result).toBe(true);
  });

  it('generates well-formed Atom XML', () => {
    const feed = generateAtomFeed({
      id: 'https://example.com/',
      title: 'Test',
      link: 'https://example.com',
      updated: new Date(),
      author: { name: 'Author' },
      entries: [
        {
          id: 'entry-1',
          title: 'Entry',
          summary: 'Summary',
          link: 'https://example.com/entry',
          published: new Date(),
          updated: new Date(),
          author: { name: 'Author' },
        },
      ],
    });

    const result = XMLValidator.validate(feed);
    expect(result).toBe(true);
  });

  it('can be parsed by XML parser', () => {
    const feed = generateRSSFeed({
      title: 'Test Blog',
      description: 'Description',
      siteUrl: 'https://example.com',
      feedUrl: 'https://example.com/feed.xml',
      items: [
        {
          title: 'Test Post',
          description: 'Post description',
          link: 'https://example.com/post',
          guid: 'p1',
          pubDate: new Date('2024-01-15'),
          categories: ['tech', 'news'],
        },
      ],
    });

    const parser = new XMLParser();
    const parsed = parser.parse(feed);

    expect(parsed.rss.channel.title).toBe('Test Blog');
    expect(parsed.rss.channel.item.title).toBe('Test Post');
  });
});
```

## Related Skills

- [static-rendering](./static-rendering.md) - Pre-render feeds at build time for optimal performance
- [caching](./cache-headers.md) - Implement proper cache headers for feed responses
- [api-routes](./api-routes.md) - Build Route Handlers for serving feeds
- [seo](./seo.md) - Ensure proper feed discovery with meta tags
- [mdx-blog](./mdx-blog.md) - Generate feeds from MDX content

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Added Composition Diagram showing feed system architecture
- Added Podcast Feed Generator with iTunes namespace support
- Added Category-Specific Feeds example
- Added Feed Service with caching using unstable_cache
- Added 3 complete examples (multi-format blog, changelog, aggregator)
- Added 5 anti-patterns with code examples
- Added comprehensive testing section (unit, integration, validation)
- Expanded Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- RSS 2.0 generation
- Atom feed support
- JSON Feed format
