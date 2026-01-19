---
id: pt-edge-functions
name: Edge Functions
version: 2.0.0
layer: L5
category: edge
description: Deploy serverless functions at the edge for low-latency responses
tags: [edge, serverless, vercel, cloudflare, latency]
composes: []
dependencies: []
formula: runtime='edge' + Web APIs + Edge KV = Ultra-Low Latency Functions
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Building low-latency API endpoints for global users
- Implementing A/B testing with deterministic variant assignment
- Streaming AI responses from edge locations
- Rate limiting with distributed counters
- Processing geolocation-aware requests

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge Functions Architecture                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Global Request                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edge Location (one of many worldwide)               │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Edge Function (runtime = 'edge')            │   │   │
│  │  │                                             │   │   │
│  │  │ Available:                                  │   │   │
│  │  │ - fetch() for HTTP requests                 │   │   │
│  │  │ - crypto for cryptographic operations       │   │   │
│  │  │ - TextEncoder/Decoder                       │   │   │
│  │  │ - ReadableStream for streaming              │   │   │
│  │  │ - Edge KV for distributed storage           │   │   │
│  │  │                                             │   │   │
│  │  │ NOT Available:                              │   │   │
│  │  │ - fs, path (Node.js modules)                │   │   │
│  │  │ - Native bindings (bcrypt, sharp)           │   │   │
│  │  │ - Heavy computation                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Benefits:                                                  │
│  - Sub-millisecond cold starts                             │
│  - Global distribution (50+ locations)                     │
│  - Automatic scaling                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Functions

Deploy serverless functions at the edge for ultra-low latency responses closer to your users.

## Overview

Edge functions provide:
- Sub-millisecond cold starts
- Global distribution
- Low latency responses
- Lightweight compute
- Geographic routing

## Implementation

### Edge Runtime in Route Handlers

```typescript
// app/api/geo/route.ts
import { NextRequest, NextResponse } from "next/server";

// Opt into Edge runtime
export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Access geolocation data (Vercel provides this)
  const country = request.geo?.country || "Unknown";
  const city = request.geo?.city || "Unknown";
  const region = request.geo?.region || "Unknown";
  
  return NextResponse.json({
    country,
    city,
    region,
    timestamp: Date.now(),
  });
}

// app/api/edge-data/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  
  // Fetch from origin or edge cache
  const data = await fetch(`https://api.example.com/data/${id}`, {
    headers: {
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
    // Cache at edge for 60 seconds
    next: { revalidate: 60 },
  });
  
  return NextResponse.json(await data.json());
}
```

### Edge API with KV Storage

```typescript
// app/api/feature-flags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  
  // Get feature flags from edge KV
  const flags = await kv.hgetall(`flags:${userId}`) || {};
  const globalFlags = await kv.hgetall("flags:global") || {};
  
  return NextResponse.json({
    ...globalFlags,
    ...flags,
  });
}

export async function POST(request: NextRequest) {
  const { flag, value, userId } = await request.json();
  
  if (userId) {
    await kv.hset(`flags:${userId}`, { [flag]: value });
  } else {
    await kv.hset("flags:global", { [flag]: value });
  }
  
  return NextResponse.json({ success: true });
}
```

### Edge Function with Streaming

```typescript
// app/api/stream/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Stream data chunks
      for (let i = 0; i < 10; i++) {
        const chunk = encoder.encode(`data: ${JSON.stringify({ count: i })}\n\n`);
        controller.enqueue(chunk);
        
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### Edge Function with AI Inference

```typescript
// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  
  // Call AI API from edge
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  
  const data = await response.json();
  
  return NextResponse.json({
    response: data.choices[0].message.content,
  });
}

// Streaming AI response
export async function GET(request: NextRequest) {
  const prompt = request.nextUrl.searchParams.get("prompt");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });
  
  // Stream the response directly to client
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

### Edge Function with Rate Limiting

```typescript
// app/api/limited/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

export const runtime = "edge";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function GET(request: NextRequest) {
  // Get identifier (IP or user ID)
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }
  
  // Process request
  return NextResponse.json(
    { message: "Success" },
    {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
    }
  );
}
```

### Edge Function with A/B Testing

```typescript
// app/api/experiment/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const EXPERIMENTS = {
  "new-checkout": {
    variants: ["control", "variant-a", "variant-b"],
    weights: [0.5, 0.25, 0.25],
  },
  "pricing-page": {
    variants: ["original", "simplified"],
    weights: [0.5, 0.5],
  },
};

function getVariant(experimentId: string, userId: string): string {
  const experiment = EXPERIMENTS[experimentId as keyof typeof EXPERIMENTS];
  if (!experiment) return "control";
  
  // Deterministic assignment based on user ID
  const hash = hashCode(`${experimentId}:${userId}`);
  const normalized = (hash % 100) / 100;
  
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i];
    if (normalized < cumulative) {
      return experiment.variants[i];
    }
  }
  
  return experiment.variants[0];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function GET(request: NextRequest) {
  const experimentId = request.nextUrl.searchParams.get("experiment");
  const userId = request.cookies.get("user_id")?.value || crypto.randomUUID();
  
  if (!experimentId) {
    return NextResponse.json({ error: "Missing experiment ID" }, { status: 400 });
  }
  
  const variant = getVariant(experimentId, userId);
  
  const response = NextResponse.json({
    experimentId,
    variant,
    userId,
  });
  
  // Set user ID cookie if not present
  if (!request.cookies.get("user_id")) {
    response.cookies.set("user_id", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  
  return response;
}
```

### Edge Function with Image Processing

```typescript
// app/api/image/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  const width = parseInt(searchParams.get("w") || "800");
  const quality = parseInt(searchParams.get("q") || "75");
  
  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }
  
  // Fetch and transform image using Cloudflare Images or similar
  const imageResponse = await fetch(url);
  const imageBuffer = await imageResponse.arrayBuffer();
  
  // For actual image processing, you'd use a service like:
  // - Cloudflare Images
  // - Vercel's Image Optimization
  // - Sharp (not available in Edge runtime)
  
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
```

## Variants

### Conditional Edge Runtime

```typescript
// app/api/hybrid/route.ts
// Use edge for simple operations, Node.js for complex ones

// Simple endpoint - use Edge
// app/api/simple/route.ts
export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ time: Date.now() });
}

// Complex endpoint - use Node.js
// app/api/complex/route.ts
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Heavy computation or Node.js-specific APIs
  const result = await complexComputation();
  return NextResponse.json(result);
}
```

### Edge with Fallback

```typescript
// lib/edge/with-fallback.ts
import { NextRequest, NextResponse } from "next/server";

export function withEdgeFallback(
  edgeHandler: (req: NextRequest) => Promise<Response>,
  fallbackUrl: string
) {
  return async (request: NextRequest) => {
    try {
      return await edgeHandler(request);
    } catch (error) {
      // Fallback to origin on error
      const response = await fetch(fallbackUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }
  };
}
```

## Anti-patterns

### Heavy Computation at Edge

```typescript
// BAD: CPU-intensive work at edge
export const runtime = "edge";

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // This will hit CPU limits quickly!
  const result = heavyCryptoOperation(data);
  
  return NextResponse.json(result);
}

// GOOD: Offload heavy work to Node.js runtime
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const result = heavyCryptoOperation(data);
  return NextResponse.json(result);
}
```

### Large Response Bodies

```typescript
// BAD: Large responses at edge
export const runtime = "edge";

export async function GET() {
  // Edge has memory limits (~128MB typically)
  const hugeDataset = await fetchHugeDataset();
  return NextResponse.json(hugeDataset);
}

// GOOD: Stream large responses
export const runtime = "edge";

export async function GET() {
  const stream = await streamLargeDataset();
  return new Response(stream);
}
```

### Using Node.js APIs

```typescript
// BAD: Node.js APIs don't exist in Edge
export const runtime = "edge";

import fs from "fs"; // Error! fs not available
import path from "path"; // Limited support

// GOOD: Use Web APIs only
export const runtime = "edge";

// Use fetch, crypto, TextEncoder/Decoder, etc.
const response = await fetch(url);
const hash = await crypto.subtle.digest("SHA-256", data);
```

## Related Skills

- `edge-middleware` - Middleware at the edge
- `edge-kv` - Key-value storage at edge
- `geolocation` - Geographic routing
- `rate-limiting` - Rate limiting patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Vercel Edge Functions
