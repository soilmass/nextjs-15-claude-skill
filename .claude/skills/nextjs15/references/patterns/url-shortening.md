---
id: pt-url-shortening
name: URL Shortener Logic
version: 1.0.0
layer: L5
category: utilities
description: URL shortening service implementation for Next.js applications
tags: [url, shortener, links, redirect, next15]
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../molecules/card.md
  - ../molecules/toast.md
dependencies: []
formula: Short Code Generation + Redirect Handler + Analytics = URL Shortener
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# URL Shortener Logic

## When to Use

- **Link sharing**: Creating shareable short links for marketing
- **Analytics**: Tracking link clicks and referrers
- **Custom domains**: Branded short URLs
- **QR codes**: Generating scannable short URLs

**Avoid when**: Simple redirects suffice, or using third-party services (Bitly, TinyURL).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ URL Shortener Architecture                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ URL Service                                           │  │
│  │  ├─ Code Generator: Unique short codes               │  │
│  │  ├─ Redirect Handler: Fast lookup and redirect       │  │
│  │  └─ Analytics: Click tracking, geolocation           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Create     │     │ Redirect     │     │ Analytics   │   │
│  │ Short URL  │     │ Middleware   │     │ Dashboard   │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Types

```typescript
// lib/url-shortener/types.ts
export interface ShortUrl {
  id: string;
  code: string;
  originalUrl: string;
  title?: string;
  userId?: string;
  expiresAt?: Date;
  createdAt: Date;
  clicks: number;
}

export interface UrlClick {
  id: string;
  shortUrlId: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  clickedAt: Date;
}

export interface UrlStats {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  topCountries: { country: string; clicks: number }[];
  topDevices: { device: string; clicks: number }[];
}
```

## URL Service

```typescript
// lib/url-shortener/service.ts
import { db } from '@/lib/db';
import { ShortUrl, UrlClick, UrlStats } from './types';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';

const BASE_URL = process.env.SHORT_URL_DOMAIN || 'https://short.example.com';
const CODE_LENGTH = 7;

export class UrlShortenerService {
  async createShortUrl(
    originalUrl: string,
    options: { userId?: string; customCode?: string; expiresAt?: Date; title?: string } = {}
  ): Promise<ShortUrl> {
    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    // Generate or validate code
    let code = options.customCode || nanoid(CODE_LENGTH);

    if (options.customCode) {
      const existing = await db.shortUrl.findUnique({ where: { code } });
      if (existing) throw new Error('Custom code already in use');
    }

    // Ensure uniqueness
    while (await db.shortUrl.findUnique({ where: { code } })) {
      code = nanoid(CODE_LENGTH);
    }

    return db.shortUrl.create({
      data: {
        code,
        originalUrl,
        title: options.title,
        userId: options.userId,
        expiresAt: options.expiresAt,
      },
    });
  }

  async getByCode(code: string): Promise<ShortUrl | null> {
    return db.shortUrl.findUnique({ where: { code } });
  }

  async resolveAndTrack(
    code: string,
    metadata: { referrer?: string; userAgent?: string; ip?: string }
  ): Promise<string | null> {
    const shortUrl = await this.getByCode(code);

    if (!shortUrl) return null;
    if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) return null;

    // Track click asynchronously
    this.trackClick(shortUrl.id, metadata).catch(console.error);

    return shortUrl.originalUrl;
  }

  private async trackClick(
    shortUrlId: string,
    metadata: { referrer?: string; userAgent?: string; ip?: string }
  ): Promise<void> {
    const parser = new UAParser(metadata.userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();

    // Get geolocation from IP (you'd use a service like MaxMind or ip-api)
    const geo = await this.getGeoFromIp(metadata.ip);

    await db.urlClick.create({
      data: {
        shortUrlId,
        referrer: metadata.referrer,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ip,
        country: geo?.country,
        city: geo?.city,
        device: device.type || 'desktop',
        browser: browser.name,
      },
    });

    await db.shortUrl.update({
      where: { id: shortUrlId },
      data: { clicks: { increment: 1 } },
    });
  }

  private async getGeoFromIp(ip?: string): Promise<{ country?: string; city?: string } | null> {
    if (!ip || ip === '127.0.0.1') return null;
    // Implement IP geolocation lookup
    return null;
  }

  async getStats(shortUrlId: string, days = 30): Promise<UrlStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await db.urlClick.findMany({
      where: { shortUrlId, clickedAt: { gte: startDate } },
    });

    const totalClicks = clicks.length;
    const uniqueVisitors = new Set(clicks.map((c) => c.ipAddress)).size;

    // Clicks by day
    const clicksByDay = clicks.reduce((acc, click) => {
      const date = click.clickedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top referrers
    const referrerCounts = clicks.reduce((acc, click) => {
      const ref = click.referrer || 'Direct';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top countries
    const countryCounts = clicks.reduce((acc, click) => {
      const country = click.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top devices
    const deviceCounts = clicks.reduce((acc, click) => {
      const device = click.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClicks,
      uniqueVisitors,
      clicksByDay: Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks })),
      topReferrers: Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([referrer, clicks]) => ({ referrer, clicks })),
      topCountries: Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, clicks]) => ({ country, clicks })),
      topDevices: Object.entries(deviceCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([device, clicks]) => ({ device, clicks })),
    };
  }

  getShortUrl(code: string): string {
    return `${BASE_URL}/${code}`;
  }
}

export const urlShortenerService = new UrlShortenerService();
```

## Redirect Handler

```typescript
// app/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { urlShortenerService } from '@/lib/url-shortener/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const originalUrl = await urlShortenerService.resolveAndTrack(params.code, {
    referrer: request.headers.get('referer') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
  });

  if (!originalUrl) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.redirect(originalUrl);
}
```

## API Routes

```typescript
// app/api/urls/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { urlShortenerService } from '@/lib/url-shortener/service';
import { z } from 'zod';

const createSchema = z.object({
  url: z.string().url(),
  customCode: z.string().min(4).max(20).optional(),
  title: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  try {
    const shortUrl = await urlShortenerService.createShortUrl(parsed.data.url, {
      userId: session?.user?.id,
      customCode: parsed.data.customCode,
      title: parsed.data.title,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    });

    return NextResponse.json({
      ...shortUrl,
      shortUrl: urlShortenerService.getShortUrl(shortUrl.code),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create short URL' },
      { status: 400 }
    );
  }
}
```

## URL Shortener Form Component

```typescript
// components/url-shortener/create-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Link } from 'lucide-react';
import { toast } from 'sonner';

export function UrlShortenerForm() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error('Failed to shorten URL');

      const data = await res.json();
      setShortUrl(data.shortUrl);
      toast.success('URL shortened successfully');
    } catch {
      toast.error('Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://example.com/very-long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten'}
          </Button>
        </form>

        {shortUrl && (
          <div className="flex gap-2 p-3 bg-muted rounded-md">
            <Input value={shortUrl} readOnly className="bg-transparent border-none" />
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Related Patterns

- [url-validation](./url-validation.md)
- [analytics](./analytics.md)
- [qr-codes](./qr-codes.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Short code generation
- Click tracking
- Analytics dashboard
