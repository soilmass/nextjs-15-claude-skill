---
id: pt-blue-green
name: Blue-Green Deployment
version: 2.0.0
layer: L5
category: devops
description: Implement blue-green deployment strategy for zero-downtime releases in Next.js 15
tags: [blue-green, deployment, zero-downtime, staging, production]
composes: []
dependencies: []
formula: "Dual Environments + Health Verification + Atomic Switch = Zero-Downtime Deployment"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Blue-Green Deployment Pattern

## Overview

Blue-green deployment maintains two identical production environments, allowing instant switches between versions with zero downtime. This pattern covers implementing blue-green deployments for Next.js 15 with various infrastructure options.

## When to Use

- Requiring zero-downtime deployments for production applications
- Need instant rollback capability without redeployment
- Running critical applications that cannot tolerate deployment failures
- Validating new versions in production-like environment before switch
- Implementing atomic deployment switches

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │           BLUE-GREEN DEPLOYMENT                  │
                    └─────────────────────────────────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │    LOAD BALANCER /    │
                              │    TRAFFIC ROUTER     │
                              └───────────┬───────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     │                     ▼
    ┌───────────────────────────┐        │        ┌───────────────────────────┐
    │       BLUE SLOT           │        │        │       GREEN SLOT          │
    │    (Active/Standby)       │◀───────┴───────▶│    (Standby/Active)       │
    ├───────────────────────────┤                 ├───────────────────────────┤
    │  • Next.js App v1.0       │                 │  • Next.js App v1.1       │
    │  • Database Connection    │                 │  • Database Connection    │
    │  • Health Check Endpoint  │                 │  • Health Check Endpoint  │
    └───────────────────────────┘                 └───────────────────────────┘
                    │                                           │
                    └─────────────────┬─────────────────────────┘
                                      │
                              ┌───────┴───────┐
                              │  Controller   │
                              │  + State Mgmt │
                              └───────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  Switch Flow: Deploy to Standby → Health Check → Atomic Switch → Verify │
    └─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Environment Configuration

```typescript
// lib/deployment/blue-green.ts
export type DeploymentSlot = 'blue' | 'green';

export interface SlotConfig {
  slot: DeploymentSlot;
  url: string;
  version: string;
  deployedAt: Date;
  status: 'active' | 'standby' | 'deploying' | 'unhealthy';
}

export interface BlueGreenState {
  activeSlot: DeploymentSlot;
  blue: SlotConfig;
  green: SlotConfig;
  lastSwitch: Date;
}

// Determine current slot from environment
export function getCurrentSlot(): DeploymentSlot {
  return (process.env.DEPLOYMENT_SLOT as DeploymentSlot) || 'blue';
}

export function getSlotUrl(slot: DeploymentSlot): string {
  return slot === 'blue'
    ? process.env.BLUE_URL || 'https://blue.example.com'
    : process.env.GREEN_URL || 'https://green.example.com';
}

export function getActiveUrl(): string {
  return process.env.PRODUCTION_URL || 'https://example.com';
}
```

### Traffic Router Middleware

```typescript
// middleware.ts (for custom blue-green routing)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In practice, this would be in a database or edge config
async function getActiveSlot(): Promise<'blue' | 'green'> {
  // Could fetch from Redis, Edge Config, or external service
  const response = await fetch(`${process.env.CONFIG_API}/active-slot`, {
    next: { revalidate: 10 }, // Cache for 10 seconds
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.activeSlot;
  }
  
  return 'blue'; // Default
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Only route on main domain
  if (!hostname.includes('example.com') || hostname.includes('blue.') || hostname.includes('green.')) {
    return NextResponse.next();
  }
  
  const activeSlot = await getActiveSlot();
  const targetUrl = activeSlot === 'blue'
    ? process.env.BLUE_INTERNAL_URL
    : process.env.GREEN_INTERNAL_URL;
  
  // Rewrite to active slot
  const url = new URL(request.url);
  url.hostname = new URL(targetUrl!).hostname;
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/:path*',
};
```

### Blue-Green Controller

```typescript
// lib/deployment/controller.ts
import { redis } from '@/lib/redis';
import type { BlueGreenState, DeploymentSlot, SlotConfig } from './blue-green';

const STATE_KEY = 'deployment:blue-green-state';

export class BlueGreenController {
  async getState(): Promise<BlueGreenState> {
    const data = await redis.get(STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default state
    return {
      activeSlot: 'blue',
      blue: {
        slot: 'blue',
        url: process.env.BLUE_URL!,
        version: '0.0.0',
        deployedAt: new Date(),
        status: 'active',
      },
      green: {
        slot: 'green',
        url: process.env.GREEN_URL!,
        version: '0.0.0',
        deployedAt: new Date(),
        status: 'standby',
      },
      lastSwitch: new Date(),
    };
  }
  
  async setState(state: BlueGreenState): Promise<void> {
    await redis.set(STATE_KEY, JSON.stringify(state));
  }
  
  async getActiveSlot(): Promise<DeploymentSlot> {
    const state = await this.getState();
    return state.activeSlot;
  }
  
  async getStandbySlot(): Promise<DeploymentSlot> {
    const active = await this.getActiveSlot();
    return active === 'blue' ? 'green' : 'blue';
  }
  
  async updateSlotStatus(
    slot: DeploymentSlot,
    updates: Partial<SlotConfig>
  ): Promise<void> {
    const state = await this.getState();
    state[slot] = { ...state[slot], ...updates };
    await this.setState(state);
  }
  
  async switchSlots(): Promise<{ from: DeploymentSlot; to: DeploymentSlot }> {
    const state = await this.getState();
    const from = state.activeSlot;
    const to = from === 'blue' ? 'green' : 'blue';
    
    // Verify standby is healthy
    if (state[to].status !== 'standby') {
      throw new Error(`Cannot switch: ${to} slot is ${state[to].status}`);
    }
    
    // Perform switch
    state.activeSlot = to;
    state[from].status = 'standby';
    state[to].status = 'active';
    state.lastSwitch = new Date();
    
    await this.setState(state);
    
    return { from, to };
  }
  
  async prepareDeployment(): Promise<DeploymentSlot> {
    const standby = await this.getStandbySlot();
    await this.updateSlotStatus(standby, { status: 'deploying' });
    return standby;
  }
  
  async completeDeployment(
    slot: DeploymentSlot,
    version: string
  ): Promise<void> {
    await this.updateSlotStatus(slot, {
      status: 'standby',
      version,
      deployedAt: new Date(),
    });
  }
  
  async markUnhealthy(slot: DeploymentSlot): Promise<void> {
    await this.updateSlotStatus(slot, { status: 'unhealthy' });
  }
}

export const blueGreenController = new BlueGreenController();
```

### Health Verification

```typescript
// lib/deployment/health-checker.ts
import type { DeploymentSlot } from './blue-green';
import { getSlotUrl } from './blue-green';
import { blueGreenController } from './controller';

interface HealthCheckResult {
  healthy: boolean;
  responseTime: number;
  checks: {
    http: boolean;
    database: boolean;
    version: string | null;
  };
}

export async function checkSlotHealth(
  slot: DeploymentSlot
): Promise<HealthCheckResult> {
  const url = getSlotUrl(slot);
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${url}/api/health`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        healthy: false,
        responseTime,
        checks: { http: false, database: false, version: null },
      };
    }
    
    const data = await response.json();
    
    return {
      healthy: data.status === 'healthy',
      responseTime,
      checks: {
        http: true,
        database: data.checks?.database ?? true,
        version: data.version,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - startTime,
      checks: { http: false, database: false, version: null },
    };
  }
}

export async function verifySlotReady(
  slot: DeploymentSlot,
  maxRetries = 10,
  delayMs = 5000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await checkSlotHealth(slot);
    
    if (result.healthy) {
      console.log(`Slot ${slot} is healthy (attempt ${i + 1})`);
      return true;
    }
    
    console.log(`Slot ${slot} not ready, retrying in ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  console.error(`Slot ${slot} failed health checks after ${maxRetries} attempts`);
  await blueGreenController.markUnhealthy(slot);
  return false;
}

export async function performSwitch(): Promise<boolean> {
  const state = await blueGreenController.getState();
  const standby = state.activeSlot === 'blue' ? 'green' : 'blue';
  
  // Final health check before switch
  const isHealthy = await verifySlotReady(standby, 3, 2000);
  
  if (!isHealthy) {
    console.error('Cannot switch: standby slot is unhealthy');
    return false;
  }
  
  // Perform the switch
  const result = await blueGreenController.switchSlots();
  console.log(`Switched from ${result.from} to ${result.to}`);
  
  // Verify active slot is serving traffic
  const activeHealthy = await checkSlotHealth(result.to);
  
  if (!activeHealthy.healthy) {
    // Rollback immediately
    console.error('New active slot unhealthy, rolling back');
    await blueGreenController.switchSlots();
    return false;
  }
  
  return true;
}
```

### Deployment API Routes

```typescript
// app/api/deployment/switch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blueGreenController } from '@/lib/deployment/controller';
import { performSwitch, checkSlotHealth } from '@/lib/deployment/health-checker';

// Authorization middleware
function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token === process.env.DEPLOYMENT_SECRET;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const success = await performSwitch();
    
    if (success) {
      const state = await blueGreenController.getState();
      return NextResponse.json({
        success: true,
        activeSlot: state.activeSlot,
        message: `Switched to ${state.activeSlot}`,
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Switch failed, check logs' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// app/api/deployment/status/route.ts
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const state = await blueGreenController.getState();
  const blueHealth = await checkSlotHealth('blue');
  const greenHealth = await checkSlotHealth('green');
  
  return NextResponse.json({
    ...state,
    health: {
      blue: blueHealth,
      green: greenHealth,
    },
  });
}
```

### Docker Compose Blue-Green

```yaml
# docker-compose.blue-green.yml
version: '3.8'

services:
  # Blue environment
  app-blue:
    image: myapp:${BLUE_VERSION:-latest}
    environment:
      - DEPLOYMENT_SLOT=blue
      - DATABASE_URL=${BLUE_DATABASE_URL}
      - PORT=3001
    ports:
      - "3001:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.blue.rule=Host(`blue.example.com`)"
      - "traefik.http.services.blue.loadbalancer.server.port=3000"

  # Green environment
  app-green:
    image: myapp:${GREEN_VERSION:-latest}
    environment:
      - DEPLOYMENT_SLOT=green
      - DATABASE_URL=${GREEN_DATABASE_URL}
      - PORT=3002
    ports:
      - "3002:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.green.rule=Host(`green.example.com`)"
      - "traefik.http.services.green.loadbalancer.server.port=3000"

  # Traefik as reverse proxy/router
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

### Traefik Dynamic Router Switch

```yaml
# traefik/dynamic/blue-green.yml
http:
  routers:
    production:
      rule: "Host(`example.com`)"
      service: active-service
      entryPoints:
        - web

  services:
    active-service:
      loadBalancer:
        servers:
          # This gets updated on switch
          - url: "http://app-blue:3000"
    
    blue-service:
      loadBalancer:
        servers:
          - url: "http://app-blue:3000"
    
    green-service:
      loadBalancer:
        servers:
          - url: "http://app-green:3000"
```

### GitHub Actions Blue-Green Deploy

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Get standby slot
        id: slot
        run: |
          STANDBY=$(curl -s -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
            ${{ secrets.API_URL }}/api/deployment/status | jq -r '.activeSlot')
          if [ "$STANDBY" = "blue" ]; then
            echo "target=green" >> $GITHUB_OUTPUT
          else
            echo "target=blue" >> $GITHUB_OUTPUT
          fi
      
      - name: Deploy to standby slot
        run: |
          # Update standby environment with new image
          ssh ${{ secrets.DEPLOY_HOST }} << EOF
            cd /app
            export ${SLOT}_VERSION=${{ github.sha }}
            docker-compose -f docker-compose.blue-green.yml up -d app-${{ steps.slot.outputs.target }}
          EOF
        env:
          SLOT: ${{ steps.slot.outputs.target }}
      
      - name: Wait for healthy
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s https://${{ steps.slot.outputs.target }}.example.com/api/health | jq -r '.status')
            if [ "$STATUS" = "healthy" ]; then
              echo "Standby slot is healthy"
              exit 0
            fi
            echo "Waiting for standby to be healthy..."
            sleep 10
          done
          echo "Standby slot never became healthy"
          exit 1
      
      - name: Switch traffic
        run: |
          curl -X POST -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
            ${{ secrets.API_URL }}/api/deployment/switch
      
      - name: Verify production
        run: |
          sleep 10
          STATUS=$(curl -s https://example.com/api/health | jq -r '.status')
          if [ "$STATUS" != "healthy" ]; then
            echo "Production unhealthy after switch!"
            # Trigger rollback
            curl -X POST -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
              ${{ secrets.API_URL }}/api/deployment/switch
            exit 1
          fi
      
      - name: Notify success
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Blue-green deploy complete to ${{ steps.slot.outputs.target }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Variants

### Vercel Blue-Green with Aliases

```typescript
// scripts/vercel-blue-green.ts
import { execSync } from 'child_process';

async function deploy() {
  // Deploy to preview (standby)
  const deployOutput = execSync('vercel --prod-preview', { encoding: 'utf-8' });
  const previewUrl = deployOutput.match(/https:\/\/[^\s]+/)?.[0];
  
  console.log(`Deployed to preview: ${previewUrl}`);
  
  // Health check
  const healthResponse = await fetch(`${previewUrl}/api/health`);
  if (!healthResponse.ok) {
    throw new Error('Preview deployment unhealthy');
  }
  
  // Promote to production
  execSync(`vercel alias ${previewUrl} production.example.com`);
  
  console.log('Promoted to production');
}

deploy().catch(console.error);
```

## Anti-Patterns

```typescript
// Bad: No health checks before switch
await switchSlots(); // Might switch to broken deployment

// Good: Verify health first
if (await verifySlotReady(standbySlot)) {
  await switchSlots();
}

// Bad: Same database for both slots
// Can cause issues with migrations

// Good: Separate databases or migration strategy
const dbUrl = slot === 'blue' ? BLUE_DB_URL : GREEN_DB_URL;

// Bad: Manual switch without automation
// Error-prone and slow

// Good: Automated switch with verification
await performSwitch(); // Handles health checks and rollback
```

## Related Skills

- `docker` - Container orchestration
- `rollback` - Quick rollback strategies
- `health-checks` - Service verification
- `zero-downtime` - Zero-downtime patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial blue-green deployment pattern
