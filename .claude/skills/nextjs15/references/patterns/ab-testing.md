---
id: pt-ab-testing
name: A/B Testing
version: 2.0.0
layer: L5
category: performance
description: A/B testing implementation with feature flags and analytics
tags: [ab-testing, experiments, feature-flags, analytics, optimization]
composes: []
dependencies: []
formula: "ab_testing = variant_assignment + cookie_persistence + analytics_tracking + statistical_significance"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# A/B Testing

## Overview

A comprehensive A/B testing pattern for running experiments with variant assignment, persistent user bucketing, and analytics tracking.

## When to Use

- **Conversion optimization**: Test CTAs, pricing, layouts
- **Feature rollouts**: Gradual feature deployment with metrics
- **UI experiments**: Compare design variants
- **Personalization**: Test recommendation algorithms
- **Marketing campaigns**: Landing page variations
- **Performance testing**: Compare implementation approaches

## Composition Diagram

```
+------------------+
|   User Request   |
+------------------+
          |
          v
+------------------+     +------------------+
| Variant Assignment| --> | Cookie Storage   |
| (hash/random)     |     | (persistent)     |
+------------------+     +------------------+
          |
          v
+------------------+
| Experiment Provider|
| (React Context)   |
+------------------+
          |
    +-----+-----+
    |           |
    v           v
+--------+  +--------+
|Control |  |Variant |
|Component| |Component|
+--------+  +--------+
          |
          v
+------------------+
| Analytics Track  |
| (conversion events)|
+------------------+
          |
          v
+------------------+
| Statistical Analysis|
| (significance calc) |
+------------------+
```

## Implementation

### Experiment Provider

```tsx
// lib/experiments/experiment-provider.tsx
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { getCookie, setCookie } from 'cookies-next';

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[];
  active: boolean;
}

interface ExperimentContextValue {
  getVariant: (experimentId: string) => string | null;
  trackConversion: (experimentId: string, eventName: string, value?: number) => void;
  experiments: Map<string, string>;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

export function useExperiment(experimentId: string) {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  
  const variant = context.getVariant(experimentId);
  const trackConversion = useCallback(
    (eventName: string, value?: number) => {
      context.trackConversion(experimentId, eventName, value);
    },
    [context, experimentId]
  );

  return { variant, trackConversion };
}

interface ExperimentProviderProps {
  children: ReactNode;
  experiments: Experiment[];
  userId?: string;
}

export function ExperimentProvider({
  children,
  experiments,
  userId,
}: ExperimentProviderProps) {
  const experimentMap = useMemo(() => {
    const map = new Map<string, string>();
    
    experiments.forEach((experiment) => {
      if (!experiment.active) return;

      // Check for existing assignment
      const cookieKey = `exp_${experiment.id}`;
      let variant = getCookie(cookieKey) as string | undefined;

      if (!variant) {
        // Assign variant based on weights or uniform distribution
        variant = assignVariant(experiment, userId);
        setCookie(cookieKey, variant, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }

      map.set(experiment.id, variant);
    });

    return map;
  }, [experiments, userId]);

  const getVariant = useCallback(
    (experimentId: string) => {
      return experimentMap.get(experimentId) || null;
    },
    [experimentMap]
  );

  const trackConversion = useCallback(
    (experimentId: string, eventName: string, value?: number) => {
      const variant = experimentMap.get(experimentId);
      if (!variant) return;

      // Track to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
          experiment_id: experimentId,
          variant,
          value,
        });
      }

      // Also send to your backend
      fetch('/api/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          variant,
          eventName,
          value,
          timestamp: Date.now(),
        }),
      }).catch(console.error);
    },
    [experimentMap]
  );

  return (
    <ExperimentContext.Provider
      value={{ getVariant, trackConversion, experiments: experimentMap }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

function assignVariant(experiment: Experiment, userId?: string): string {
  const { variants, weights } = experiment;
  
  // Use userId for deterministic assignment if available
  const seed = userId
    ? hashString(`${experiment.id}-${userId}`)
    : Math.random();

  if (weights && weights.length === variants.length) {
    // Weighted distribution
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const normalized = seed * totalWeight;

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) {
        return variants[i];
      }
    }
  }

  // Uniform distribution
  const index = Math.floor(seed * variants.length);
  return variants[index];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}
```

### Experiment Component

```tsx
// components/experiments/experiment.tsx
'use client';

import { ReactNode } from 'react';
import { useExperiment } from '@/lib/experiments/experiment-provider';

interface ExperimentProps {
  id: string;
  children: (variant: string | null) => ReactNode;
  fallback?: ReactNode;
}

export function Experiment({ id, children, fallback }: ExperimentProps) {
  const { variant } = useExperiment(id);

  if (!variant && fallback) {
    return <>{fallback}</>;
  }

  return <>{children(variant)}</>;
}

// Variant-specific components
interface VariantProps {
  experimentId: string;
  variant: string;
  children: ReactNode;
}

export function Variant({ experimentId, variant, children }: VariantProps) {
  const { variant: assignedVariant } = useExperiment(experimentId);

  if (assignedVariant !== variant) {
    return null;
  }

  return <>{children}</>;
}

// Control variant (original/default)
interface ControlProps {
  experimentId: string;
  children: ReactNode;
}

export function Control({ experimentId, children }: ControlProps) {
  return (
    <Variant experimentId={experimentId} variant="control">
      {children}
    </Variant>
  );
}

// Treatment variant (new/test)
interface TreatmentProps {
  experimentId: string;
  variant?: string;
  children: ReactNode;
}

export function Treatment({ experimentId, variant = 'treatment', children }: TreatmentProps) {
  return (
    <Variant experimentId={experimentId} variant={variant}>
      {children}
    </Variant>
  );
}
```

### Server-Side Assignment

```tsx
// lib/experiments/server.ts
import { cookies } from 'next/headers';

interface Experiment {
  id: string;
  variants: string[];
  weights?: number[];
  active: boolean;
}

export async function getServerExperiment(
  experiment: Experiment,
  userId?: string
): Promise<string | null> {
  if (!experiment.active) return null;

  const cookieStore = await cookies();
  const cookieKey = `exp_${experiment.id}`;
  let variant = cookieStore.get(cookieKey)?.value;

  if (!variant) {
    // Assign variant server-side
    variant = assignVariant(experiment, userId);
    // Note: Setting cookies in Server Components requires using
    // Route Handlers or Server Actions
  }

  return variant;
}

function assignVariant(experiment: Experiment, userId?: string): string {
  const { variants, weights } = experiment;
  const seed = userId
    ? hashString(`${experiment.id}-${userId}`)
    : Math.random();

  if (weights && weights.length === variants.length) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const normalized = seed * totalWeight;

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) {
        return variants[i];
      }
    }
  }

  const index = Math.floor(seed * variants.length);
  return variants[index];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}
```

### Middleware for Edge Experiments

```tsx
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const experiments = {
  'new-homepage': {
    variants: ['control', 'variant-a', 'variant-b'],
    weights: [0.5, 0.25, 0.25],
  },
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check each experiment
  Object.entries(experiments).forEach(([id, config]) => {
    const cookieKey = `exp_${id}`;
    const existingVariant = request.cookies.get(cookieKey);

    if (!existingVariant) {
      const variant = assignVariantAtEdge(config.variants, config.weights);
      response.cookies.set(cookieKey, variant, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
  });

  return response;
}

function assignVariantAtEdge(variants: string[], weights?: number[]): string {
  const seed = Math.random();

  if (weights && weights.length === variants.length) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const normalized = seed * totalWeight;

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) {
        return variants[i];
      }
    }
  }

  const index = Math.floor(seed * variants.length);
  return variants[index];
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Analytics Tracking API

```tsx
// app/api/experiments/track/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface TrackingEvent {
  experimentId: string;
  variant: string;
  eventName: string;
  value?: number;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const event: TrackingEvent = await request.json();

    // Store in database
    await storeExperimentEvent(event);

    // Forward to analytics service
    await forwardToAnalytics(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track experiment event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

async function storeExperimentEvent(event: TrackingEvent) {
  // Store in your database
  // Example with Prisma:
  // await prisma.experimentEvent.create({ data: event });
}

async function forwardToAnalytics(event: TrackingEvent) {
  // Forward to external analytics
  // Example: Mixpanel, Amplitude, etc.
}
```

### Experiment Dashboard Component

```tsx
// components/experiments/experiment-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, CheckCircle } from 'lucide-react';

interface ExperimentStats {
  id: string;
  name: string;
  variants: {
    name: string;
    participants: number;
    conversions: number;
    conversionRate: number;
  }[];
  winner?: string;
  significance: number;
}

export function ExperimentDashboard() {
  const [experiments, setExperiments] = useState<ExperimentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/experiments/stats')
      .then((res) => res.json())
      .then(setExperiments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading experiments...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Active Experiments
      </h2>

      {experiments.map((experiment) => (
        <div
          key={experiment.id}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {experiment.name}
            </h3>
            {experiment.winner && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Winner: {experiment.winner}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {experiment.variants.map((variant) => (
              <div
                key={variant.name}
                className={`rounded-lg border p-4 ${
                  variant.name === experiment.winner
                    ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {variant.name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(variant.conversionRate * 100).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">conversion</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {variant.participants}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {variant.conversions}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>
              Statistical significance: {(experiment.significance * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Usage

```tsx
// Layout setup
import { ExperimentProvider } from '@/lib/experiments/experiment-provider';

const experiments = [
  {
    id: 'new-cta-button',
    name: 'New CTA Button Test',
    variants: ['control', 'blue', 'green'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
];

export default function RootLayout({ children }) {
  return (
    <ExperimentProvider experiments={experiments}>
      {children}
    </ExperimentProvider>
  );
}

// Component usage
import { Experiment, Control, Treatment } from '@/components/experiments/experiment';
import { useExperiment } from '@/lib/experiments/experiment-provider';

function CTAButton() {
  const { variant, trackConversion } = useExperiment('new-cta-button');

  const handleClick = () => {
    trackConversion('cta_clicked');
    // Handle click
  };

  return (
    <Experiment id="new-cta-button">
      {(variant) => (
        <button
          onClick={handleClick}
          className={variant === 'blue' ? 'bg-blue-500' : variant === 'green' ? 'bg-green-500' : 'bg-gray-500'}
        >
          Get Started
        </button>
      )}
    </Experiment>
  );
}

// Or with Control/Treatment components
function PricingSection() {
  return (
    <>
      <Control experimentId="pricing-layout">
        <OldPricingLayout />
      </Control>
      <Treatment experimentId="pricing-layout">
        <NewPricingLayout />
      </Treatment>
    </>
  );
}
```

## Related Skills

- [L5/analytics-events](./analytics-events.md) - Event tracking
- [L5/feature-flags](./feature-flags.md) - Feature flag management
- [L3/stats-dashboard](../organisms/stats-dashboard.md) - Dashboard stats

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with client/server/edge support
