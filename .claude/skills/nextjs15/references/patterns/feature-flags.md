---
id: pt-feature-flags
name: Feature Flags
version: 2.0.0
layer: L5
category: devops
description: Implement feature flags for gradual rollouts and A/B testing in Next.js 15
tags: [feature-flags, rollout, a-b-testing, toggles, experimentation]
composes: []
dependencies: []
formula: "Flag Registry + Evaluation Context + Deterministic Assignment = Controlled Feature Rollout"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Feature Flags Pattern

## Overview

Feature flags enable controlled feature rollouts, A/B testing, and quick feature toggles without deployments. This pattern covers implementing feature flags in Next.js 15 with server components, edge middleware, and third-party services like LaunchDarkly or Vercel Edge Config.

## When to Use

- Rolling out new features to specific user segments
- Running A/B tests on UI or functionality changes
- Quickly disabling features without redeployment
- Managing access to beta or premium features
- Implementing kill switches for risky features

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │              FEATURE FLAGS SYSTEM                │
                    └─────────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │  FLAG REGISTRY│           │  EVALUATION   │           │    STORAGE    │
    │               │           │    ENGINE     │           │               │
    ├───────────────┤           ├───────────────┤           ├───────────────┤
    │• Key          │           │• User Context │           │• Edge Config  │
    │• Default Value│──────────▶│• % Rollout    │◀──────────│• Redis/KV     │
    │• Target Users │           │• Group Match  │           │• LaunchDarkly │
    │• Environment  │           │• Date Check   │           │• PostHog      │
    └───────────────┘           └───────┬───────┘           └───────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │  Server       │   │    Edge       │   │    Client     │
            │  Components   │   │  Middleware   │   │   Provider    │
            │  (RSC)        │   │  (Routing)    │   │   (React)     │
            └───────────────┘   └───────────────┘   └───────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  Evaluation: User Hash → Flag Key → Percentage Bucket → Boolean     │
    └─────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Feature Flag Types

```typescript
// lib/feature-flags/types.ts
export type FlagValue = boolean | string | number | Record<string, unknown>;

export interface FeatureFlag<T extends FlagValue = boolean> {
  key: string;
  defaultValue: T;
  description: string;
  // Rollout percentage (0-100)
  rolloutPercentage?: number;
  // Target specific users
  targetUsers?: string[];
  // Target specific groups
  targetGroups?: string[];
  // Date-based activation
  enabledFrom?: Date;
  enabledUntil?: Date;
  // Environment restrictions
  environments?: ('development' | 'preview' | 'production')[];
}

export interface FlagEvaluationContext {
  userId?: string;
  userGroups?: string[];
  environment: string;
  timestamp: Date;
  // Custom attributes for targeting
  attributes?: Record<string, unknown>;
}

export interface FlagEvaluation<T extends FlagValue = boolean> {
  value: T;
  reason: 'default' | 'targeted' | 'rollout' | 'scheduled' | 'disabled';
  flagKey: string;
}
```

### Feature Flag Registry

```typescript
// lib/feature-flags/registry.ts
import type { FeatureFlag, FlagValue } from './types';

// Define all feature flags
export const FLAGS = {
  NEW_DASHBOARD: {
    key: 'new-dashboard',
    defaultValue: false,
    description: 'Enable new dashboard UI',
    rolloutPercentage: 20,
    environments: ['development', 'preview'],
  },
  
  DARK_MODE: {
    key: 'dark-mode',
    defaultValue: false,
    description: 'Enable dark mode toggle',
    rolloutPercentage: 100,
  },
  
  PRICING_EXPERIMENT: {
    key: 'pricing-experiment',
    defaultValue: 'control',
    description: 'A/B test for pricing page',
    rolloutPercentage: 50,
  },
  
  MAX_UPLOAD_SIZE: {
    key: 'max-upload-size',
    defaultValue: 10,
    description: 'Maximum file upload size in MB',
    targetGroups: ['premium'],
  },
  
  BETA_FEATURES: {
    key: 'beta-features',
    defaultValue: false,
    description: 'Enable beta feature access',
    targetGroups: ['beta-testers'],
    environments: ['development', 'preview', 'production'],
  },
} as const satisfies Record<string, FeatureFlag<FlagValue>>;

export type FlagKey = keyof typeof FLAGS;
```

### Feature Flag Evaluator

```typescript
// lib/feature-flags/evaluator.ts
import { FLAGS, type FlagKey } from './registry';
import type { FlagEvaluationContext, FlagEvaluation, FlagValue } from './types';
import { getEnvironment } from '@/lib/environment';

// Deterministic hash for consistent rollout
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function isInRollout(userId: string, flagKey: string, percentage: number): boolean {
  const hash = hashString(`${userId}:${flagKey}`);
  return (hash % 100) < percentage;
}

export function evaluateFlag<K extends FlagKey>(
  flagKey: K,
  context: FlagEvaluationContext
): FlagEvaluation<typeof FLAGS[K]['defaultValue']> {
  const flag = FLAGS[flagKey];
  const currentEnv = getEnvironment();
  
  type ReturnValue = typeof FLAGS[K]['defaultValue'];
  
  // Check environment restrictions
  if (flag.environments && !flag.environments.includes(currentEnv as any)) {
    return {
      value: flag.defaultValue as ReturnValue,
      reason: 'disabled',
      flagKey: flag.key,
    };
  }
  
  // Check date-based activation
  const now = context.timestamp;
  if (flag.enabledFrom && now < flag.enabledFrom) {
    return {
      value: flag.defaultValue as ReturnValue,
      reason: 'scheduled',
      flagKey: flag.key,
    };
  }
  if (flag.enabledUntil && now > flag.enabledUntil) {
    return {
      value: flag.defaultValue as ReturnValue,
      reason: 'scheduled',
      flagKey: flag.key,
    };
  }
  
  // Check user targeting
  if (flag.targetUsers && context.userId) {
    if (flag.targetUsers.includes(context.userId)) {
      return {
        value: getEnabledValue(flag) as ReturnValue,
        reason: 'targeted',
        flagKey: flag.key,
      };
    }
  }
  
  // Check group targeting
  if (flag.targetGroups && context.userGroups) {
    const hasGroup = flag.targetGroups.some(g => context.userGroups!.includes(g));
    if (hasGroup) {
      return {
        value: getEnabledValue(flag) as ReturnValue,
        reason: 'targeted',
        flagKey: flag.key,
      };
    }
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && context.userId) {
    if (isInRollout(context.userId, flag.key, flag.rolloutPercentage)) {
      return {
        value: getEnabledValue(flag) as ReturnValue,
        reason: 'rollout',
        flagKey: flag.key,
      };
    }
  }
  
  return {
    value: flag.defaultValue as ReturnValue,
    reason: 'default',
    flagKey: flag.key,
  };
}

function getEnabledValue(flag: { defaultValue: FlagValue }): FlagValue {
  if (typeof flag.defaultValue === 'boolean') {
    return true;
  }
  // For non-boolean flags, return an "enabled" variant
  // This could be configured per-flag
  return flag.defaultValue;
}

// Evaluate multiple flags at once
export function evaluateFlags(
  flagKeys: FlagKey[],
  context: FlagEvaluationContext
): Record<string, FlagEvaluation> {
  const results: Record<string, FlagEvaluation> = {};
  
  for (const key of flagKeys) {
    results[key] = evaluateFlag(key, context);
  }
  
  return results;
}
```

### Server Component Integration

```typescript
// lib/feature-flags/server.ts
import { cookies, headers } from 'next/headers';
import { evaluateFlag, evaluateFlags } from './evaluator';
import { FLAGS, type FlagKey } from './registry';
import { getEnvironment } from '@/lib/environment';
import { auth } from '@/lib/auth';

async function getEvaluationContext() {
  const session = await auth();
  const cookieStore = await cookies();
  
  // Get or create anonymous ID for non-authenticated users
  let userId = session?.user?.id;
  if (!userId) {
    userId = cookieStore.get('anonymous_id')?.value;
  }
  
  return {
    userId,
    userGroups: session?.user?.groups || [],
    environment: getEnvironment(),
    timestamp: new Date(),
    attributes: {
      plan: session?.user?.plan,
      country: (await headers()).get('x-vercel-ip-country'),
    },
  };
}

// Server-side flag evaluation
export async function getFlag<K extends FlagKey>(flagKey: K) {
  const context = await getEvaluationContext();
  return evaluateFlag(flagKey, context);
}

export async function getFlags(flagKeys: FlagKey[]) {
  const context = await getEvaluationContext();
  return evaluateFlags(flagKeys, context);
}

// Check if flag is enabled (boolean flags)
export async function isEnabled(flagKey: FlagKey): Promise<boolean> {
  const result = await getFlag(flagKey);
  return result.value === true;
}
```

### React Server Component Usage

```tsx
// app/dashboard/page.tsx
import { getFlag, isEnabled } from '@/lib/feature-flags/server';
import { NewDashboard } from '@/components/new-dashboard';
import { LegacyDashboard } from '@/components/legacy-dashboard';

export default async function DashboardPage() {
  const newDashboardFlag = await getFlag('NEW_DASHBOARD');
  const darkModeEnabled = await isEnabled('DARK_MODE');
  
  return (
    <div data-dark-mode={darkModeEnabled}>
      {newDashboardFlag.value ? (
        <NewDashboard />
      ) : (
        <LegacyDashboard />
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 text-xs bg-gray-100 p-2 rounded">
          <p>New Dashboard: {String(newDashboardFlag.value)} ({newDashboardFlag.reason})</p>
        </div>
      )}
    </div>
  );
}
```

### Client-Side Feature Flags

```tsx
// components/feature-flag-provider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { FlagEvaluation } from '@/lib/feature-flags/types';

interface FeatureFlagContextValue {
  flags: Record<string, FlagEvaluation>;
  isEnabled: (key: string) => boolean;
  getValue: <T>(key: string) => T | undefined;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
  initialFlags: Record<string, FlagEvaluation>;
}

export function FeatureFlagProvider({ 
  children, 
  initialFlags 
}: FeatureFlagProviderProps) {
  const value: FeatureFlagContextValue = {
    flags: initialFlags,
    isEnabled: (key) => initialFlags[key]?.value === true,
    getValue: <T,>(key: string) => initialFlags[key]?.value as T | undefined,
  };
  
  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

export function useFeatureFlag(key: string) {
  const { flags } = useFeatureFlags();
  return flags[key];
}

export function useIsEnabled(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}
```

### Layout with Provider

```tsx
// app/layout.tsx
import { FeatureFlagProvider } from '@/components/feature-flag-provider';
import { getFlags } from '@/lib/feature-flags/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch commonly used flags
  const flags = await getFlags(['NEW_DASHBOARD', 'DARK_MODE', 'BETA_FEATURES']);
  
  return (
    <html lang="en">
      <body>
        <FeatureFlagProvider initialFlags={flags}>
          {children}
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
```

### Middleware for Feature Flags

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { evaluateFlag } from '@/lib/feature-flags/evaluator';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get or create anonymous ID
  let anonymousId = request.cookies.get('anonymous_id')?.value;
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    response.cookies.set('anonymous_id', anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }
  
  // Evaluate flags at edge for routing decisions
  const context = {
    userId: anonymousId,
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date(),
  };
  
  const newDashboard = evaluateFlag('NEW_DASHBOARD', context);
  
  // Rewrite to different routes based on flags
  if (request.nextUrl.pathname === '/dashboard' && newDashboard.value) {
    return NextResponse.rewrite(new URL('/dashboard-v2', request.url));
  }
  
  // Add flag headers for debugging
  response.headers.set('x-flag-new-dashboard', String(newDashboard.value));
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Vercel Edge Config Integration

```typescript
// lib/feature-flags/edge-config.ts
import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG);

interface EdgeConfigFlag {
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetGroups?: string[];
}

export async function getFlagFromEdgeConfig(key: string): Promise<EdgeConfigFlag | null> {
  try {
    const flag = await edgeConfig.get<EdgeConfigFlag>(`flags.${key}`);
    return flag;
  } catch (error) {
    console.error(`Error fetching flag ${key}:`, error);
    return null;
  }
}

export async function getAllFlagsFromEdgeConfig(): Promise<Record<string, EdgeConfigFlag>> {
  try {
    const flags = await edgeConfig.get<Record<string, EdgeConfigFlag>>('flags');
    return flags || {};
  } catch (error) {
    console.error('Error fetching flags:', error);
    return {};
  }
}
```

### A/B Testing with Analytics

```typescript
// lib/feature-flags/analytics.ts
import { evaluateFlag } from './evaluator';
import type { FlagKey } from './registry';

interface ExperimentEvent {
  flagKey: string;
  variant: string;
  userId: string;
  timestamp: Date;
}

export async function trackExperiment(
  flagKey: FlagKey,
  userId: string,
  variant: string
) {
  const event: ExperimentEvent = {
    flagKey,
    variant,
    userId,
    timestamp: new Date(),
  };
  
  // Send to analytics service
  if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('$experiment_started', {
        $feature_flag: flagKey,
        $feature_flag_response: variant,
      });
    }
    
    // Custom analytics endpoint
    await fetch('/api/analytics/experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  }
}

// Component for tracking
export function ExperimentTracker({
  flagKey,
  variant,
  userId,
}: {
  flagKey: FlagKey;
  variant: string;
  userId: string;
}) {
  // Track on mount (client-side)
  useEffect(() => {
    trackExperiment(flagKey, userId, variant);
  }, [flagKey, variant, userId]);
  
  return null;
}
```

## Variants

### LaunchDarkly Integration

```typescript
// lib/feature-flags/launchdarkly.ts
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY!);

export async function getLDFlag<T>(
  key: string,
  userId: string,
  defaultValue: T
): Promise<T> {
  await client.waitForInitialization();
  
  const context = {
    kind: 'user',
    key: userId,
  };
  
  return client.variation(key, context, defaultValue);
}
```

### Posthog Feature Flags

```typescript
// lib/feature-flags/posthog.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

export async function getPosthogFlag(
  key: string,
  distinctId: string
): Promise<boolean | string> {
  return posthog.getFeatureFlag(key, distinctId) ?? false;
}

export async function getAllPosthogFlags(distinctId: string) {
  return posthog.getAllFlags(distinctId);
}
```

## Anti-Patterns

```typescript
// Bad: Checking flags inline everywhere
if (process.env.ENABLE_NEW_FEATURE === 'true') {
  // Scattered, hard to track
}

// Good: Centralized flag system
if (await isEnabled('NEW_FEATURE')) {
  // Centralized, trackable
}

// Bad: Non-deterministic rollout
const enabled = Math.random() < 0.5; // Different on every request!

// Good: Deterministic based on user ID
const enabled = isInRollout(userId, flagKey, 50); // Consistent per user

// Bad: No fallback for flag errors
const flag = await getRemoteFlag('key'); // Might throw!

// Good: Always have defaults
const flag = await getRemoteFlag('key').catch(() => defaultValue);
```

## Related Skills

- `edge-middleware` - Evaluate flags at edge
- `preview-deployments` - Test flags in preview
- `cookies` - Store user assignments
- `analytics` - Track flag exposure

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial feature flags pattern with multiple providers
