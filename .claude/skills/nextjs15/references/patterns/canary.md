---
id: pt-canary
name: Canary Deployment
version: 2.0.0
layer: L5
category: devops
description: Implement canary deployments for gradual rollouts with traffic splitting in Next.js 15
tags: [canary, deployment, gradual-rollout, traffic-splitting, progressive]
composes: []
dependencies: []
formula: "Traffic Splitting + Metrics Collection + Auto-Promotion = Safe Progressive Rollout"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Canary Deployment Pattern

## Overview

Canary deployments gradually route traffic to a new version, allowing early detection of issues with minimal user impact. This pattern covers implementing canary releases in Next.js 15 using edge middleware, weighted routing, and automated promotion/rollback based on metrics.

## When to Use

- Rolling out high-risk changes to production gradually
- Testing new features with a subset of real users
- Detecting performance regressions before full rollout
- Running A/B tests on infrastructure changes
- Validating changes with specific user segments or regions

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │            CANARY DEPLOYMENT                     │
                    └─────────────────────────────────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │   EDGE MIDDLEWARE     │
                              │   Traffic Router      │
                              └───────────┬───────────┘
                                          │
                                    ┌─────┴─────┐
                             (95%)  │           │  (5%)
                    ┌───────────────┘           └───────────────┐
                    │                                           │
                    ▼                                           ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │      STABLE VERSION       │             │      CANARY VERSION       │
    │     (Production v1.0)     │             │     (Testing v1.1)        │
    └───────────┬───────────────┘             └───────────┬───────────────┘
                │                                         │
                └────────────────┬────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    METRICS COLLECTOR    │
                    │  • Error Rate           │
                    │  • Latency P50/P95/P99  │
                    │  • Request Count        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   CANARY AUTOMATION     │
                    │  • Auto-promote (✓)     │
                    │  • Auto-rollback (✗)    │
                    │  • Gradual increase     │
                    └─────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  Canary Flow: 5% → 10% → 25% → 50% → 100% (based on health metrics) │
    └─────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Canary Configuration

```typescript
// lib/deployment/canary.ts
export interface CanaryConfig {
  // Current canary percentage (0-100)
  percentage: number;
  // Target versions
  stableVersion: string;
  canaryVersion: string;
  // URLs
  stableUrl: string;
  canaryUrl: string;
  // Automatic promotion settings
  autoPromote: boolean;
  promoteAfterMinutes: number;
  // Rollback thresholds
  errorRateThreshold: number;
  latencyThreshold: number;
  // Targeting
  targetUsers?: string[];
  targetRegions?: string[];
}

export interface CanaryState {
  config: CanaryConfig;
  status: 'active' | 'promoting' | 'rolling-back' | 'stable';
  startedAt: Date;
  metrics: CanaryMetrics;
}

export interface CanaryMetrics {
  stable: VersionMetrics;
  canary: VersionMetrics;
}

export interface VersionMetrics {
  requestCount: number;
  errorCount: number;
  totalLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}
```

### Canary Controller

```typescript
// lib/deployment/canary-controller.ts
import { redis } from '@/lib/redis';
import type { CanaryConfig, CanaryState, VersionMetrics } from './canary';

const CANARY_KEY = 'deployment:canary';
const METRICS_KEY = 'deployment:canary:metrics';

export class CanaryController {
  async getState(): Promise<CanaryState | null> {
    const data = await redis.get(CANARY_KEY);
    return data ? JSON.parse(data) : null;
  }
  
  async setState(state: CanaryState): Promise<void> {
    await redis.set(CANARY_KEY, JSON.stringify(state));
  }
  
  async startCanary(config: CanaryConfig): Promise<void> {
    const state: CanaryState = {
      config,
      status: 'active',
      startedAt: new Date(),
      metrics: {
        stable: this.emptyMetrics(),
        canary: this.emptyMetrics(),
      },
    };
    
    await this.setState(state);
    await this.resetMetrics();
  }
  
  async updatePercentage(percentage: number): Promise<void> {
    const state = await this.getState();
    if (!state) throw new Error('No active canary');
    
    state.config.percentage = Math.min(100, Math.max(0, percentage));
    await this.setState(state);
  }
  
  async incrementPercentage(increment = 10): Promise<number> {
    const state = await this.getState();
    if (!state) throw new Error('No active canary');
    
    const newPercentage = Math.min(100, state.config.percentage + increment);
    await this.updatePercentage(newPercentage);
    
    return newPercentage;
  }
  
  async promote(): Promise<void> {
    const state = await this.getState();
    if (!state) throw new Error('No active canary');
    
    state.status = 'promoting';
    state.config.percentage = 100;
    await this.setState(state);
    
    // After promotion is confirmed, mark as stable
    state.status = 'stable';
    state.config.stableVersion = state.config.canaryVersion;
    await this.setState(state);
  }
  
  async rollback(): Promise<void> {
    const state = await this.getState();
    if (!state) throw new Error('No active canary');
    
    state.status = 'rolling-back';
    state.config.percentage = 0;
    await this.setState(state);
    
    // Clear canary state after rollback
    await redis.del(CANARY_KEY);
  }
  
  async recordMetric(
    version: 'stable' | 'canary',
    latency: number,
    isError: boolean
  ): Promise<void> {
    const key = `${METRICS_KEY}:${version}`;
    
    // Use Redis pipeline for atomic updates
    const pipeline = redis.pipeline();
    pipeline.hincrby(key, 'requestCount', 1);
    if (isError) {
      pipeline.hincrby(key, 'errorCount', 1);
    }
    pipeline.hincrbyfloat(key, 'totalLatency', latency);
    pipeline.lpush(`${key}:latencies`, latency);
    pipeline.ltrim(`${key}:latencies`, 0, 999); // Keep last 1000
    
    await pipeline.exec();
  }
  
  async getMetrics(): Promise<CanaryMetrics> {
    const [stable, canary] = await Promise.all([
      this.getVersionMetrics('stable'),
      this.getVersionMetrics('canary'),
    ]);
    
    return { stable, canary };
  }
  
  private async getVersionMetrics(version: 'stable' | 'canary'): Promise<VersionMetrics> {
    const key = `${METRICS_KEY}:${version}`;
    
    const [data, latencies] = await Promise.all([
      redis.hgetall(key),
      redis.lrange(`${key}:latencies`, 0, -1),
    ]);
    
    const requestCount = parseInt(data.requestCount || '0', 10);
    const errorCount = parseInt(data.errorCount || '0', 10);
    const totalLatency = parseFloat(data.totalLatency || '0');
    
    // Calculate percentiles
    const sortedLatencies = latencies.map(Number).sort((a, b) => a - b);
    const p50 = this.percentile(sortedLatencies, 50);
    const p95 = this.percentile(sortedLatencies, 95);
    const p99 = this.percentile(sortedLatencies, 99);
    
    return {
      requestCount,
      errorCount,
      totalLatency,
      p50Latency: p50,
      p95Latency: p95,
      p99Latency: p99,
    };
  }
  
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  }
  
  private emptyMetrics(): VersionMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      totalLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
    };
  }
  
  private async resetMetrics(): Promise<void> {
    await redis.del(`${METRICS_KEY}:stable`);
    await redis.del(`${METRICS_KEY}:canary`);
    await redis.del(`${METRICS_KEY}:stable:latencies`);
    await redis.del(`${METRICS_KEY}:canary:latencies`);
  }
}

export const canaryController = new CanaryController();
```

### Edge Middleware Router

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CanaryConfig {
  percentage: number;
  stableUrl: string;
  canaryUrl: string;
  targetUsers?: string[];
  targetRegions?: string[];
}

// Fetch canary config from edge config or KV
async function getCanaryConfig(): Promise<CanaryConfig | null> {
  // Use Edge Config for low-latency reads
  if (process.env.EDGE_CONFIG) {
    const { createClient } = await import('@vercel/edge-config');
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    return edgeConfig.get<CanaryConfig>('canary');
  }
  
  return null;
}

// Deterministic routing based on user ID
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}

export async function middleware(request: NextRequest) {
  const config = await getCanaryConfig();
  
  // No canary active, proceed normally
  if (!config || config.percentage === 0) {
    return NextResponse.next();
  }
  
  // Get or create user identifier
  let userId = request.cookies.get('user_id')?.value;
  if (!userId) {
    userId = crypto.randomUUID();
  }
  
  // Check if user is targeted
  if (config.targetUsers?.includes(userId)) {
    return routeToCanary(request, config, userId);
  }
  
  // Check region targeting
  const region = request.geo?.country;
  if (region && config.targetRegions?.includes(region)) {
    return routeToCanary(request, config, userId);
  }
  
  // Percentage-based routing
  const userHash = hashUserId(userId);
  const isCanary = userHash < config.percentage;
  
  if (isCanary) {
    return routeToCanary(request, config, userId);
  }
  
  // Route to stable
  const response = NextResponse.next();
  response.headers.set('x-deployment-version', 'stable');
  ensureUserCookie(response, userId);
  return response;
}

function routeToCanary(
  request: NextRequest,
  config: CanaryConfig,
  userId: string
): NextResponse {
  // Rewrite to canary deployment
  const url = new URL(request.url);
  url.hostname = new URL(config.canaryUrl).hostname;
  
  const response = NextResponse.rewrite(url);
  response.headers.set('x-deployment-version', 'canary');
  ensureUserCookie(response, userId);
  
  return response;
}

function ensureUserCookie(response: NextResponse, userId: string): void {
  response.cookies.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60,
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
```

### Metrics Collection

```typescript
// lib/deployment/canary-metrics.ts
import { canaryController } from './canary-controller';
import { headers } from 'next/headers';

export async function recordRequestMetrics(
  startTime: number,
  isError: boolean
): Promise<void> {
  const headersList = await headers();
  const version = headersList.get('x-deployment-version') as 'stable' | 'canary' | null;
  
  if (!version) return;
  
  const latency = Date.now() - startTime;
  await canaryController.recordMetric(version, latency, isError);
}

// Wrapper for API routes
export function withCanaryMetrics<T>(
  handler: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const startTime = Date.now();
    let isError = false;
    
    try {
      return await handler();
    } catch (error) {
      isError = true;
      throw error;
    } finally {
      await recordRequestMetrics(startTime, isError).catch(console.error);
    }
  };
}
```

### Automatic Promotion/Rollback

```typescript
// lib/deployment/canary-automation.ts
import { canaryController } from './canary-controller';
import type { CanaryState } from './canary';

interface AnalysisResult {
  shouldPromote: boolean;
  shouldRollback: boolean;
  reason: string;
  metrics: {
    canaryErrorRate: number;
    stableErrorRate: number;
    canaryP95: number;
    stableP95: number;
  };
}

export async function analyzeCanary(): Promise<AnalysisResult> {
  const state = await canaryController.getState();
  
  if (!state) {
    return {
      shouldPromote: false,
      shouldRollback: false,
      reason: 'No active canary',
      metrics: { canaryErrorRate: 0, stableErrorRate: 0, canaryP95: 0, stableP95: 0 },
    };
  }
  
  const metrics = await canaryController.getMetrics();
  
  const canaryErrorRate = metrics.canary.requestCount > 0
    ? metrics.canary.errorCount / metrics.canary.requestCount
    : 0;
  
  const stableErrorRate = metrics.stable.requestCount > 0
    ? metrics.stable.errorCount / metrics.stable.requestCount
    : 0;
  
  const result: AnalysisResult = {
    shouldPromote: false,
    shouldRollback: false,
    reason: '',
    metrics: {
      canaryErrorRate,
      stableErrorRate,
      canaryP95: metrics.canary.p95Latency,
      stableP95: metrics.stable.p95Latency,
    },
  };
  
  // Check error rate threshold
  if (canaryErrorRate > state.config.errorRateThreshold) {
    result.shouldRollback = true;
    result.reason = `Canary error rate (${(canaryErrorRate * 100).toFixed(2)}%) exceeds threshold (${state.config.errorRateThreshold * 100}%)`;
    return result;
  }
  
  // Check latency threshold
  if (metrics.canary.p95Latency > state.config.latencyThreshold) {
    result.shouldRollback = true;
    result.reason = `Canary P95 latency (${metrics.canary.p95Latency}ms) exceeds threshold (${state.config.latencyThreshold}ms)`;
    return result;
  }
  
  // Check if error rate is significantly higher than stable
  const errorRateRatio = stableErrorRate > 0 ? canaryErrorRate / stableErrorRate : canaryErrorRate;
  if (errorRateRatio > 2) {
    result.shouldRollback = true;
    result.reason = `Canary error rate is ${errorRateRatio.toFixed(1)}x higher than stable`;
    return result;
  }
  
  // Check if ready for promotion
  const minutesSinceStart = (Date.now() - new Date(state.startedAt).getTime()) / 60000;
  const hasEnoughTraffic = metrics.canary.requestCount >= 100;
  const isOldEnough = minutesSinceStart >= state.config.promoteAfterMinutes;
  
  if (
    state.config.autoPromote &&
    hasEnoughTraffic &&
    isOldEnough &&
    state.config.percentage >= 50
  ) {
    result.shouldPromote = true;
    result.reason = 'Canary metrics are healthy, ready for promotion';
  }
  
  return result;
}

export async function runCanaryAutomation(): Promise<void> {
  const state = await canaryController.getState();
  
  if (!state || state.status !== 'active') {
    return;
  }
  
  const analysis = await analyzeCanary();
  
  console.log('Canary analysis:', analysis);
  
  if (analysis.shouldRollback) {
    console.log(`Rolling back canary: ${analysis.reason}`);
    await canaryController.rollback();
    await notifyRollback(analysis);
  } else if (analysis.shouldPromote) {
    console.log(`Promoting canary: ${analysis.reason}`);
    await canaryController.promote();
    await notifyPromotion(analysis);
  } else if (state.config.percentage < 50) {
    // Gradually increase traffic
    const newPercentage = await canaryController.incrementPercentage(10);
    console.log(`Increased canary traffic to ${newPercentage}%`);
  }
}

async function notifyRollback(analysis: AnalysisResult): Promise<void> {
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:warning: Canary rollback triggered`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Canary Rollback*\n${analysis.reason}`,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Canary Error Rate:* ${(analysis.metrics.canaryErrorRate * 100).toFixed(2)}%` },
              { type: 'mrkdwn', text: `*Stable Error Rate:* ${(analysis.metrics.stableErrorRate * 100).toFixed(2)}%` },
              { type: 'mrkdwn', text: `*Canary P95:* ${analysis.metrics.canaryP95}ms` },
              { type: 'mrkdwn', text: `*Stable P95:* ${analysis.metrics.stableP95}ms` },
            ],
          },
        ],
      }),
    });
  }
}

async function notifyPromotion(analysis: AnalysisResult): Promise<void> {
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:rocket: Canary promoted to production`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Canary Promoted*\n${analysis.reason}`,
            },
          },
        ],
      }),
    });
  }
}
```

### Canary API Routes

```typescript
// app/api/canary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { canaryController } from '@/lib/deployment/canary-controller';
import { analyzeCanary } from '@/lib/deployment/canary-automation';

function authorize(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token === process.env.DEPLOYMENT_SECRET;
}

// GET /api/canary - Get canary status
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const state = await canaryController.getState();
  const analysis = state ? await analyzeCanary() : null;
  
  return NextResponse.json({
    state,
    analysis,
  });
}

// POST /api/canary - Start canary
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  await canaryController.startCanary({
    percentage: body.percentage || 5,
    stableVersion: body.stableVersion,
    canaryVersion: body.canaryVersion,
    stableUrl: body.stableUrl || process.env.STABLE_URL!,
    canaryUrl: body.canaryUrl || process.env.CANARY_URL!,
    autoPromote: body.autoPromote ?? true,
    promoteAfterMinutes: body.promoteAfterMinutes || 30,
    errorRateThreshold: body.errorRateThreshold || 0.01,
    latencyThreshold: body.latencyThreshold || 1000,
    targetUsers: body.targetUsers,
    targetRegions: body.targetRegions,
  });
  
  return NextResponse.json({ success: true });
}

// PATCH /api/canary - Update canary percentage
export async function PATCH(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  if (body.action === 'increment') {
    const newPercentage = await canaryController.incrementPercentage(body.amount || 10);
    return NextResponse.json({ percentage: newPercentage });
  }
  
  if (body.percentage !== undefined) {
    await canaryController.updatePercentage(body.percentage);
    return NextResponse.json({ percentage: body.percentage });
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// DELETE /api/canary - Rollback canary
export async function DELETE(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await canaryController.rollback();
  return NextResponse.json({ success: true });
}
```

### GitHub Actions Canary Workflow

```yaml
# .github/workflows/canary-deploy.yml
name: Canary Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-canary:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy canary version
        id: deploy
        run: |
          # Deploy to canary URL
          CANARY_URL=$(vercel --prod-preview --token ${{ secrets.VERCEL_TOKEN }})
          echo "canary_url=$CANARY_URL" >> $GITHUB_OUTPUT
      
      - name: Start canary
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.DEPLOYMENT_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{
              "percentage": 5,
              "canaryVersion": "${{ github.sha }}",
              "canaryUrl": "${{ steps.deploy.outputs.canary_url }}",
              "autoPromote": true,
              "promoteAfterMinutes": 30
            }' \
            ${{ secrets.API_URL }}/api/canary
      
      - name: Monitor canary
        run: |
          for i in {1..60}; do
            STATUS=$(curl -s -H "Authorization: Bearer ${{ secrets.DEPLOYMENT_SECRET }}" \
              ${{ secrets.API_URL }}/api/canary | jq -r '.state.status')
            
            echo "Canary status: $STATUS"
            
            if [ "$STATUS" = "stable" ]; then
              echo "Canary promoted successfully!"
              exit 0
            fi
            
            if [ "$STATUS" = "rolling-back" ] || [ "$STATUS" = "null" ]; then
              echo "Canary rolled back!"
              exit 1
            fi
            
            sleep 60
          done
          
          echo "Canary monitoring timeout"
          exit 1
```

## Variants

### Vercel Skew Protection

```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable Vercel's built-in canary support
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  },
};

export default nextConfig;
```

## Anti-Patterns

```typescript
// Bad: Same user gets different versions
const isCanary = Math.random() < 0.1; // Random each request!

// Good: Deterministic based on user ID
const isCanary = hashUserId(userId) < percentage;

// Bad: No metrics collection
await routeToCanary(); // How do we know if it's working?

// Good: Track everything
await recordMetric(version, latency, isError);

// Bad: Manual promotion without thresholds
await promote(); // What if it's broken?

// Good: Automated analysis
const analysis = await analyzeCanary();
if (analysis.shouldPromote) await promote();
```

## Related Skills

- `feature-flags` - Feature-level canaries
- `observability` - Metrics collection
- `rollback` - Quick rollback
- `blue-green` - Alternative deployment strategy

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial canary deployment pattern
