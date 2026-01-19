---
id: pt-edge-config
name: Edge Config
version: 2.0.0
layer: L5
category: edge
description: Store and read configuration at the edge with ultra-low latency
tags: [edge, config, vercel, feature-flags, settings]
composes: []
dependencies: []
formula: Edge Config + Feature Flags + Middleware = Dynamic Configuration at Scale
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

- Storing feature flags with instant global reads
- Implementing maintenance mode with IP allowlisting
- Managing dynamic redirects without redeployment
- Configuring A/B test variants at the edge
- Setting rate limit configurations per tier/endpoint

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Edge Config Architecture                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                      │
│  │ Vercel Dashboard │                                      │
│  │ or API Update    │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Edge Config Store (Global)                          │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ featureFlags: { newDashboard: true, ... }       │ │   │
│  │ │ maintenance:  { enabled: false, ... }           │ │   │
│  │ │ redirects:    [ { source, destination }, ... ]  │ │   │
│  │ │ rateLimits:   { default, endpoints, tiers }     │ │   │
│  │ │ experiments:  [ { id, variants, weights }, ... ] │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│           ┌────────────┼────────────┐                      │
│           ▼            ▼            ▼                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ Middleware │ │ Edge Route │ │ Server     │             │
│  │ ~0ms read  │ │ Handlers   │ │ Components │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Edge Config

Store and read configuration at the edge with near-zero latency for feature flags, settings, and dynamic configuration.

## Overview

Edge Config provides:
- Ultra-low latency reads (~0ms)
- Global distribution
- Instant updates
- Type-safe access
- Integration with middleware

## Implementation

### Basic Edge Config Setup

```typescript
// lib/edge-config/client.ts
import { createClient } from "@vercel/edge-config";

// Create client (automatically uses EDGE_CONFIG env var)
export const edgeConfig = createClient(process.env.EDGE_CONFIG);

// Type-safe config interface
export interface AppConfig {
  maintenance: boolean;
  maintenanceMessage?: string;
  featureFlags: {
    newDashboard: boolean;
    betaFeatures: boolean;
    aiAssistant: boolean;
  };
  limits: {
    maxUploadSize: number;
    maxTeamMembers: number;
    apiRateLimit: number;
  };
  redirects: Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }>;
  blockedIPs: string[];
  allowedCountries: string[];
}

// Get full config
export async function getConfig(): Promise<AppConfig | null> {
  try {
    return await edgeConfig.get<AppConfig>("config");
  } catch (error) {
    console.error("Failed to get edge config:", error);
    return null;
  }
}

// Get specific value
export async function getConfigValue<K extends keyof AppConfig>(
  key: K
): Promise<AppConfig[K] | undefined> {
  try {
    const config = await edgeConfig.get<AppConfig>("config");
    return config?.[key];
  } catch {
    return undefined;
  }
}

// Check if config has value
export async function hasConfig(key: string): Promise<boolean> {
  return edgeConfig.has(key);
}

// Get all config keys
export async function getConfigKeys(): Promise<string[]> {
  const digest = await edgeConfig.digest();
  // digest contains metadata about the config
  return Object.keys(digest);
}
```

### Maintenance Mode with Edge Config

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip maintenance check for maintenance page and API
  if (pathname === "/maintenance" || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }
  
  // Check maintenance mode
  const maintenance = await get<{
    enabled: boolean;
    message?: string;
    allowedIPs?: string[];
    endTime?: string;
  }>("maintenance");
  
  if (maintenance?.enabled) {
    // Allow specific IPs (admin access)
    const clientIP = request.ip || request.headers.get("x-forwarded-for");
    if (maintenance.allowedIPs?.includes(clientIP || "")) {
      return NextResponse.next();
    }
    
    // Check if maintenance is scheduled to end
    if (maintenance.endTime && new Date(maintenance.endTime) < new Date()) {
      // Maintenance period ended
      return NextResponse.next();
    }
    
    // Redirect to maintenance page
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.searchParams.set("message", maintenance.message || "");
    
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// app/maintenance/page.tsx
export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
        <p className="text-muted-foreground">
          {message || "We're making some improvements. Please check back soon."}
        </p>
      </div>
    </div>
  );
}
```

### Feature Flags with Edge Config

```typescript
// lib/edge-config/flags.ts
import { get } from "@vercel/edge-config";

interface FeatureFlag {
  enabled: boolean;
  percentage?: number;
  allowedUsers?: string[];
  deniedUsers?: string[];
  startDate?: string;
  endDate?: string;
}

export async function isFeatureEnabled(
  flagName: string,
  userId?: string
): Promise<boolean> {
  try {
    const flags = await get<Record<string, FeatureFlag>>("featureFlags");
    const flag = flags?.[flagName];
    
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    // Check date range
    const now = new Date();
    if (flag.startDate && new Date(flag.startDate) > now) return false;
    if (flag.endDate && new Date(flag.endDate) < now) return false;
    
    // Check user-specific rules
    if (userId) {
      if (flag.deniedUsers?.includes(userId)) return false;
      if (flag.allowedUsers?.includes(userId)) return true;
    }
    
    // Check percentage rollout
    if (flag.percentage !== undefined && userId) {
      const hash = hashString(`${flagName}:${userId}`);
      return hash < flag.percentage;
    }
    
    return flag.enabled;
  } catch {
    return false;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}

// React hook for feature flags
// hooks/use-feature-flag.ts
"use client";

import { useEffect, useState } from "react";

export function useFeatureFlag(flagName: string, userId?: string) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkFlag() {
      const res = await fetch(`/api/flags/${flagName}?userId=${userId || ""}`);
      const data = await res.json();
      setEnabled(data.enabled);
      setLoading(false);
    }
    
    checkFlag();
  }, [flagName, userId]);
  
  return { enabled, loading };
}

// API endpoint
// app/api/flags/[name]/route.ts
import { isFeatureEnabled } from "@/lib/edge-config/flags";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const userId = request.nextUrl.searchParams.get("userId") || undefined;
  
  const enabled = await isFeatureEnabled(name, userId);
  
  return NextResponse.json({ flag: name, enabled });
}
```

### Dynamic Redirects

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get redirects from Edge Config
  const redirects = await get<Redirect[]>("redirects");
  
  if (redirects) {
    const redirect = redirects.find((r) => {
      // Support wildcards
      if (r.source.includes("*")) {
        const pattern = r.source.replace(/\*/g, ".*");
        return new RegExp(`^${pattern}$`).test(pathname);
      }
      return r.source === pathname;
    });
    
    if (redirect) {
      let destination = redirect.destination;
      
      // Replace wildcards in destination
      if (redirect.source.includes("*")) {
        const pattern = redirect.source.replace(/\*/g, "(.*)");
        const match = pathname.match(new RegExp(`^${pattern}$`));
        if (match) {
          destination = redirect.destination.replace("*", match[1]);
        }
      }
      
      return NextResponse.redirect(
        new URL(destination, request.url),
        redirect.permanent ? 308 : 307
      );
    }
  }
  
  return NextResponse.next();
}
```

### A/B Testing Configuration

```typescript
// lib/edge-config/experiments.ts
import { get } from "@vercel/edge-config";

interface Experiment {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    weight: number;
    config?: Record<string, unknown>;
  }>;
  active: boolean;
}

export async function getExperiments(): Promise<Experiment[]> {
  return (await get<Experiment[]>("experiments")) || [];
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const experiments = await getExperiments();
  return experiments.find((e) => e.id === id) || null;
}

export async function assignVariant(
  experimentId: string,
  userId: string
): Promise<{
  variantId: string;
  config?: Record<string, unknown>;
} | null> {
  const experiment = await getExperiment(experimentId);
  
  if (!experiment || !experiment.active) return null;
  
  // Deterministic assignment based on user ID
  const hash = hashString(`${experimentId}:${userId}`);
  const normalized = hash / 100;
  
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (normalized < cumulative) {
      return {
        variantId: variant.id,
        config: variant.config,
      };
    }
  }
  
  return null;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}

// Usage in page
// app/pricing/page.tsx
import { assignVariant } from "@/lib/edge-config/experiments";
import { cookies } from "next/headers";

export default async function PricingPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || "anonymous";
  
  const variant = await assignVariant("pricing-test", userId);
  
  if (variant?.variantId === "new-pricing") {
    return <NewPricingPage config={variant.config} />;
  }
  
  return <OriginalPricingPage />;
}
```

### Rate Limit Configuration

```typescript
// lib/edge-config/rate-limits.ts
import { get } from "@vercel/edge-config";

interface RateLimitConfig {
  default: {
    requests: number;
    windowSeconds: number;
  };
  endpoints: Record<string, {
    requests: number;
    windowSeconds: number;
  }>;
  tiers: Record<string, {
    requests: number;
    windowSeconds: number;
  }>;
}

export async function getRateLimitConfig(): Promise<RateLimitConfig | null> {
  return get<RateLimitConfig>("rateLimits");
}

export async function getRateLimitForEndpoint(
  endpoint: string,
  tier?: string
): Promise<{ requests: number; windowSeconds: number }> {
  const config = await getRateLimitConfig();
  
  if (!config) {
    return { requests: 100, windowSeconds: 60 }; // Default
  }
  
  // Check tier-specific limits
  if (tier && config.tiers[tier]) {
    return config.tiers[tier];
  }
  
  // Check endpoint-specific limits
  if (config.endpoints[endpoint]) {
    return config.endpoints[endpoint];
  }
  
  return config.default;
}

// Usage in middleware
export async function middleware(request: NextRequest) {
  const endpoint = request.nextUrl.pathname;
  const tier = request.headers.get("x-api-tier") || "free";
  
  const rateLimit = await getRateLimitForEndpoint(endpoint, tier);
  
  // Apply rate limiting with these config values
  // ...
}
```

### Updating Edge Config

```typescript
// lib/edge-config/update.ts
// Note: Updates go through Vercel API, not Edge Config client

export async function updateEdgeConfig(
  items: Array<{
    operation: "create" | "update" | "upsert" | "delete";
    key: string;
    value?: unknown;
  }>
): Promise<boolean> {
  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    }
  );
  
  return response.ok;
}

// API endpoint for admin updates
// app/api/admin/config/route.ts
export async function PATCH(request: NextRequest) {
  // Verify admin auth
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { key, value } = await request.json();
  
  const success = await updateEdgeConfig([
    { operation: "upsert", key, value },
  ]);
  
  if (!success) {
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true });
}
```

## Variants

### Local Development Fallback

```typescript
// lib/edge-config/client.ts
import { createClient, EdgeConfigClient } from "@vercel/edge-config";

let edgeConfigClient: EdgeConfigClient | null = null;

// Local fallback config for development
const localConfig: Record<string, unknown> = {
  maintenance: { enabled: false },
  featureFlags: {
    newDashboard: true,
    betaFeatures: false,
  },
};

export async function getConfig<T>(key: string): Promise<T | undefined> {
  if (process.env.NODE_ENV === "development" && !process.env.EDGE_CONFIG) {
    return localConfig[key] as T | undefined;
  }
  
  if (!edgeConfigClient) {
    edgeConfigClient = createClient(process.env.EDGE_CONFIG);
  }
  
  return edgeConfigClient.get<T>(key);
}
```

## Anti-patterns

### Frequent Updates

```typescript
// BAD: Updating config on every request
export async function POST(request: NextRequest) {
  await updateEdgeConfig([{ operation: "update", key: "counter", value: count + 1 }]);
  // Edge Config is not designed for frequent writes!
}

// GOOD: Use Edge Config for configuration, KV for counters
import { kv } from "@vercel/kv";

export async function POST(request: NextRequest) {
  await kv.incr("counter");
}
```

### Large Values

```typescript
// BAD: Storing large datasets
await updateEdgeConfig([{
  operation: "upsert",
  key: "allProducts",
  value: hugeProductArray, // Edge Config has size limits
}]);

// GOOD: Store references or small config
await updateEdgeConfig([{
  operation: "upsert",
  key: "productConfig",
  value: { apiUrl: "/api/products", cacheTime: 3600 },
}]);
```

## Related Skills

- `edge-functions` - Edge function patterns
- `edge-middleware` - Middleware patterns
- `feature-flags` - Feature flag patterns
- `edge-kv` - Key-value storage

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Vercel Edge Config
