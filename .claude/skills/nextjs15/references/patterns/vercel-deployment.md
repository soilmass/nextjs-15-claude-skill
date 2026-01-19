---
id: pt-vercel-deployment
name: Vercel Deployment
version: 2.0.0
layer: L5
category: devops
description: Deploy Next.js applications to Vercel with best practices
tags: [deployment, vercel, ci-cd, preview, next15]
composes: []
dependencies: []
formula: "Vercel Platform + Edge Functions + Zero-Config = Optimized Next.js Deployment"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Vercel Deployment

## Overview

Vercel is the platform built by the creators of Next.js, offering the best deployment experience. This pattern covers configuration, environment variables, preview deployments, and advanced features like Edge Functions and Analytics.

## When to Use

- Deploying Next.js applications with optimal performance
- Requiring zero-config automatic deployments from Git
- Using Edge Functions for low-latency global responses
- Implementing preview deployments for every pull request
- Leveraging Vercel KV, Postgres, and other platform services

## Basic Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable Partial Prerendering
    ppr: true,
    // Typed routes
    typedRoutes: true,
  },
};

export default nextConfig;
```

## vercel.json Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/blog/:slug",
      "destination": "/posts/:slug",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/docs/:path*",
      "destination": "https://docs.example.com/:path*"
    }
  ],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Environment Variables

```bash
# .env.local (local development)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="development-secret"
NEXTAUTH_URL="http://localhost:3000"

# Production environment variables (set in Vercel dashboard)
# DATABASE_URL - from Vercel Postgres or external
# NEXTAUTH_SECRET - generate with openssl rand -base64 32
# NEXTAUTH_URL - automatic in Vercel

# Using environment variables
# lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV,
});

// Get base URL
export function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
```

## Preview Deployments

```typescript
// lib/is-preview.ts
export function isPreview() {
  return process.env.VERCEL_ENV === 'preview';
}

export function isProduction() {
  return process.env.VERCEL_ENV === 'production';
}

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Password protect preview deployments
  if (process.env.VERCEL_ENV === 'preview') {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Basic ${Buffer.from(
      `preview:${process.env.PREVIEW_PASSWORD}`
    ).toString('base64')}`;

    if (authHeader !== expectedAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Preview"' },
      });
    }
  }

  return NextResponse.next();
}

// Preview-specific data
// app/layout.tsx
import { isPreview } from '@/lib/is-preview';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {isPreview() && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 text-sm z-50">
            Preview Deployment - {process.env.VERCEL_GIT_COMMIT_REF}
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
```

## Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Custom events
// lib/analytics.ts
import { track } from '@vercel/analytics';

export function trackEvent(name: string, properties?: Record<string, any>) {
  track(name, properties);
}

// Usage
trackEvent('button_clicked', { button: 'signup' });
trackEvent('purchase_completed', { amount: 99.99, currency: 'USD' });
```

## Edge Functions

```typescript
// app/api/geo/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Access Vercel's geo headers
  const geo = {
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    country: request.headers.get('x-vercel-ip-country') || 'Unknown',
    region: request.headers.get('x-vercel-ip-country-region') || 'Unknown',
    latitude: request.headers.get('x-vercel-ip-latitude'),
    longitude: request.headers.get('x-vercel-ip-longitude'),
  };

  return NextResponse.json(geo);
}

// middleware.ts - Edge middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'US';

  // Redirect to country-specific subdomain
  if (country === 'DE' && !request.nextUrl.hostname.startsWith('de.')) {
    return NextResponse.redirect(
      new URL(request.url.replace('://www.', '://de.'))
    );
  }

  return NextResponse.next();
}
```

## Vercel Cron Jobs

```typescript
// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Cleanup old sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Cleanup old temp files
    const deletedFiles = await prisma.tempFile.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    return NextResponse.json({
      success: true,
      deletedSessions: deletedSessions.count,
      deletedFiles: deletedFiles.count,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Vercel KV (Redis)

```typescript
// lib/kv.ts
import { kv } from '@vercel/kv';

// Rate limiting
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const current = await kv.incr(key);

  if (current === 1) {
    await kv.expire(key, windowMs / 1000);
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}

// Session storage
export async function setSession(sessionId: string, data: any, ttl: number) {
  await kv.set(`session:${sessionId}`, JSON.stringify(data), { ex: ttl });
}

export async function getSession(sessionId: string) {
  const data = await kv.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}

// Caching
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await kv.get(key);
  if (cached) return cached as T;

  const fresh = await fetcher();
  await kv.set(key, fresh, { ex: ttl });
  return fresh;
}
```

## Vercel Postgres

```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';

// Direct queries
export async function getUser(id: string) {
  const { rows } = await sql`
    SELECT id, name, email FROM users WHERE id = ${id}
  `;
  return rows[0];
}

// With Drizzle ORM
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(vercelSql, { schema });

// Usage
const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
```

## Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postbuild": "npm run generate-sitemap"
  }
}
```

## Anti-patterns

### Don't Commit Secrets

```bash
# BAD - .env with secrets committed
DATABASE_URL="postgresql://user:password@host/db"

# GOOD - .env.local gitignored, secrets in Vercel dashboard
# .gitignore
.env.local
.env*.local
```

### Don't Ignore Build Errors

```typescript
// next.config.ts
const nextConfig = {
  // BAD - Ignoring TypeScript errors
  typescript: { ignoreBuildErrors: true },
  
  // GOOD - Fix errors instead
  typescript: { ignoreBuildErrors: false },
};
```

## Related Skills

- [environment-variables](./environment-variables.md)
- [docker](./docker.md)
- [ci-cd](./ci-cd.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Basic configuration
- Environment variables
- Preview deployments
- Vercel Analytics
- Edge Functions
- Cron jobs
- Vercel KV
- Vercel Postgres
