---
id: pt-rollback
name: Rollback
version: 2.0.0
layer: L5
category: devops
description: Implement safe rollback strategies for Next.js 15 deployments
tags: [devops, rollback]
composes: []
dependencies: []
formula: "Version Tracking + Health Monitoring + Automated Triggers = Safe Rollback Strategy"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Rollback Pattern

## Overview

Rollback strategies enable quick recovery from failed deployments. This pattern covers instant rollbacks with Vercel, database migration rollbacks, and automated rollback triggers based on error rates or health checks.

## When to Use

- Production deployment causes errors or performance degradation
- Database migrations need to be reverted
- Feature releases cause unexpected user impact
- Health checks indicate service degradation
- Automated recovery from failed canary/blue-green deployments

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │              ROLLBACK SYSTEM                     │
                    └─────────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐           ┌─────────────────┐           ┌───────────────┐
    │    Health     │           │    Version      │           │   Deployment  │
    │   Monitoring  │           │   Tracking      │           │   Strategies  │
    └───────┬───────┘           └────────┬────────┘           └───────┬───────┘
            │                            │                            │
            │                            │              ┌─────────────┼─────────────┐
            │                            │              │             │             │
            ▼                            ▼              ▼             ▼             ▼
    ┌───────────────┐           ┌───────────────┐  ┌────────┐  ┌──────────┐  ┌────────┐
    │  Error Rate   │           │   Deployment  │  │ Vercel │  │Blue-Green│  │ Docker │
    │  + Latency    │           │     Info      │  │Rollback│  │ Rollback │  │Rollback│
    │   Thresholds  │           │   + Commit    │  └────────┘  └──────────┘  └────────┘
    └───────────────┘           └───────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  Rollback Flow: Detect Issue → Verify Previous → Switch → Validate  │
    └─────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Deployment Version Tracking

```typescript
// lib/deployment/version.ts
export interface DeploymentInfo {
  version: string;
  commitSha: string;
  commitMessage: string;
  deployedAt: string;
  environment: string;
  deploymentId: string;
}

export function getDeploymentInfo(): DeploymentInfo {
  return {
    version: process.env.npm_package_version || '0.0.0',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 
               process.env.GITHUB_SHA || 
               'unknown',
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || '',
    deployedAt: process.env.DEPLOYMENT_TIMESTAMP || new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 
                 process.env.NODE_ENV || 
                 'development',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
  };
}

// API endpoint to check deployment info
// app/api/deployment/route.ts
import { NextResponse } from 'next/server';
import { getDeploymentInfo } from '@/lib/deployment/version';

export async function GET() {
  const info = getDeploymentInfo();
  
  return NextResponse.json({
    ...info,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    cache: boolean;
    external: boolean;
  };
  responseTime: number;
  version: string;
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkCache(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

async function checkExternalServices(): Promise<boolean> {
  try {
    const response = await fetch(process.env.EXTERNAL_API_URL!, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const startTime = Date.now();
  
  const [database, cache, external] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkExternalServices(),
  ]);
  
  const checks = { database, cache, external };
  const allHealthy = Object.values(checks).every(Boolean);
  const someHealthy = Object.values(checks).some(Boolean);
  
  const health: HealthCheck = {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    checks,
    responseTime: Date.now() - startTime,
    version: process.env.npm_package_version || '0.0.0',
  };
  
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(health, { status: statusCode });
}
```

### Vercel Rollback Script

```typescript
// scripts/rollback.ts
import { execSync } from 'child_process';

interface Deployment {
  uid: string;
  url: string;
  created: number;
  state: string;
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
  };
}

async function getDeployments(limit = 10): Promise<Deployment[]> {
  const result = execSync(
    `vercel ls --json --limit ${limit}`,
    { encoding: 'utf-8' }
  );
  
  return JSON.parse(result);
}

async function rollback(deploymentId: string): Promise<void> {
  console.log(`Rolling back to deployment: ${deploymentId}`);
  
  // Promote the deployment to production
  execSync(`vercel promote ${deploymentId} --yes`, { stdio: 'inherit' });
  
  console.log('Rollback completed successfully');
}

async function rollbackToCommit(commitSha: string): Promise<void> {
  const deployments = await getDeployments(50);
  
  const targetDeployment = deployments.find(
    d => d.meta?.githubCommitSha?.startsWith(commitSha)
  );
  
  if (!targetDeployment) {
    throw new Error(`No deployment found for commit: ${commitSha}`);
  }
  
  await rollback(targetDeployment.uid);
}

async function rollbackToPrevious(): Promise<void> {
  const deployments = await getDeployments(5);
  
  // Find the previous production deployment
  const productionDeployments = deployments.filter(
    d => d.state === 'READY'
  );
  
  if (productionDeployments.length < 2) {
    throw new Error('No previous deployment found');
  }
  
  // Skip current (index 0), rollback to previous (index 1)
  await rollback(productionDeployments[1].uid);
}

// CLI interface
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'previous':
    rollbackToPrevious();
    break;
  case 'commit':
    if (!arg) {
      console.error('Usage: rollback commit <sha>');
      process.exit(1);
    }
    rollbackToCommit(arg);
    break;
  case 'deployment':
    if (!arg) {
      console.error('Usage: rollback deployment <id>');
      process.exit(1);
    }
    rollback(arg);
    break;
  default:
    console.log('Usage: rollback <previous|commit|deployment> [arg]');
}
```

### Database Migration Rollback

```typescript
// lib/db/migrations.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface Migration {
  id: string;
  migration_name: string;
  started_at: Date;
  finished_at: Date | null;
  applied_steps_count: number;
}

export async function getAppliedMigrations(): Promise<Migration[]> {
  const migrations = await prisma.$queryRaw<Migration[]>`
    SELECT * FROM _prisma_migrations 
    ORDER BY started_at DESC
  `;
  
  return migrations;
}

export async function rollbackLastMigration(): Promise<void> {
  // Get the last migration
  const migrations = await getAppliedMigrations();
  
  if (migrations.length === 0) {
    throw new Error('No migrations to rollback');
  }
  
  const lastMigration = migrations[0];
  console.log(`Rolling back migration: ${lastMigration.migration_name}`);
  
  // Create rollback SQL (you need to maintain these)
  const rollbackPath = `prisma/migrations/${lastMigration.migration_name}/down.sql`;
  
  try {
    // Execute rollback SQL
    execSync(`npx prisma db execute --file ${rollbackPath}`, {
      stdio: 'inherit',
    });
    
    // Remove migration record
    await prisma.$executeRaw`
      DELETE FROM _prisma_migrations 
      WHERE id = ${lastMigration.id}
    `;
    
    console.log('Migration rolled back successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// scripts/db-rollback.ts
import { rollbackLastMigration } from '@/lib/db/migrations';

async function main() {
  const count = parseInt(process.argv[2] || '1', 10);
  
  for (let i = 0; i < count; i++) {
    await rollbackLastMigration();
  }
}

main().catch(console.error);
```

### Automated Rollback Monitor

```typescript
// lib/deployment/monitor.ts
import { getDeploymentInfo } from './version';

interface RollbackTrigger {
  type: 'error_rate' | 'latency' | 'health_check';
  threshold: number;
  window: number; // seconds
}

interface MonitorConfig {
  healthEndpoint: string;
  checkInterval: number; // ms
  triggers: RollbackTrigger[];
  webhookUrl?: string;
  onRollbackNeeded?: () => Promise<void>;
}

class DeploymentMonitor {
  private config: MonitorConfig;
  private errorCount = 0;
  private requestCount = 0;
  private latencies: number[] = [];
  private lastHealthy = true;
  private intervalId?: NodeJS.Timeout;
  
  constructor(config: MonitorConfig) {
    this.config = config;
  }
  
  start() {
    this.intervalId = setInterval(
      () => this.checkHealth(),
      this.config.checkInterval
    );
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  recordRequest(success: boolean, latency: number) {
    this.requestCount++;
    if (!success) this.errorCount++;
    this.latencies.push(latency);
    
    // Keep only last 1000 latencies
    if (this.latencies.length > 1000) {
      this.latencies = this.latencies.slice(-1000);
    }
    
    this.checkTriggers();
  }
  
  private async checkHealth() {
    try {
      const start = Date.now();
      const response = await fetch(this.config.healthEndpoint, {
        signal: AbortSignal.timeout(10000),
      });
      
      const latency = Date.now() - start;
      const healthy = response.ok;
      
      if (!healthy && this.lastHealthy) {
        console.error('Health check failed, deployment may be unhealthy');
        await this.triggerRollback('health_check');
      }
      
      this.lastHealthy = healthy;
      this.recordRequest(healthy, latency);
    } catch (error) {
      console.error('Health check error:', error);
      this.lastHealthy = false;
    }
  }
  
  private checkTriggers() {
    for (const trigger of this.config.triggers) {
      switch (trigger.type) {
        case 'error_rate':
          const errorRate = this.requestCount > 0 
            ? this.errorCount / this.requestCount 
            : 0;
          if (errorRate > trigger.threshold) {
            this.triggerRollback('error_rate');
          }
          break;
          
        case 'latency':
          const avgLatency = this.latencies.length > 0
            ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
            : 0;
          if (avgLatency > trigger.threshold) {
            this.triggerRollback('latency');
          }
          break;
      }
    }
  }
  
  private async triggerRollback(reason: string) {
    const deployment = getDeploymentInfo();
    
    console.error(`Rollback triggered! Reason: ${reason}`);
    console.error(`Deployment: ${deployment.deploymentId}`);
    console.error(`Version: ${deployment.version}`);
    
    // Send webhook notification
    if (this.config.webhookUrl) {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'rollback_triggered',
          reason,
          deployment,
          metrics: {
            errorCount: this.errorCount,
            requestCount: this.requestCount,
            avgLatency: this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length,
          },
        }),
      });
    }
    
    // Execute rollback
    if (this.config.onRollbackNeeded) {
      await this.config.onRollbackNeeded();
    }
  }
}

// Usage
const monitor = new DeploymentMonitor({
  healthEndpoint: '/api/health',
  checkInterval: 30000, // 30 seconds
  triggers: [
    { type: 'error_rate', threshold: 0.1, window: 60 }, // 10% errors
    { type: 'latency', threshold: 5000, window: 60 }, // 5s avg latency
  ],
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  onRollbackNeeded: async () => {
    // Trigger Vercel rollback via API
    await fetch('https://api.vercel.com/v12/deployments/promote', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: process.env.VERCEL_TEAM_ID,
        deploymentId: 'PREVIOUS_DEPLOYMENT_ID', // Would need to track this
      }),
    });
  },
});
```

### GitHub Actions Rollback Workflow

```yaml
# .github/workflows/rollback.yml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      target:
        description: 'Rollback target (previous, commit sha, or deployment id)'
        required: true
        default: 'previous'
      reason:
        description: 'Reason for rollback'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: List recent deployments
        run: |
          vercel ls --token ${{ secrets.VERCEL_TOKEN }} --scope ${{ secrets.VERCEL_ORG_ID }} | head -10
      
      - name: Execute rollback
        run: |
          if [ "${{ inputs.target }}" = "previous" ]; then
            # Get previous deployment
            PREV_DEPLOYMENT=$(vercel ls --token ${{ secrets.VERCEL_TOKEN }} --scope ${{ secrets.VERCEL_ORG_ID }} --json | jq -r '.[1].uid')
            vercel promote $PREV_DEPLOYMENT --token ${{ secrets.VERCEL_TOKEN }} --scope ${{ secrets.VERCEL_ORG_ID }} --yes
          else
            # Rollback to specific deployment/commit
            vercel promote ${{ inputs.target }} --token ${{ secrets.VERCEL_TOKEN }} --scope ${{ secrets.VERCEL_ORG_ID }} --yes
          fi
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production rollback executed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Rollback Completed*\n• Target: ${{ inputs.target }}\n• Reason: ${{ inputs.reason }}\n• Triggered by: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      
      - name: Verify health after rollback
        run: |
          sleep 30  # Wait for deployment
          curl -f https://yourdomain.com/api/health || exit 1
```

### Feature Flag Rollback

```typescript
// lib/deployment/feature-rollback.ts
import { redis } from '@/lib/redis';

interface FeatureState {
  enabled: boolean;
  rolloutPercentage: number;
  timestamp: Date;
}

// Quick feature disable without deployment
export async function disableFeature(featureKey: string): Promise<void> {
  const state: FeatureState = {
    enabled: false,
    rolloutPercentage: 0,
    timestamp: new Date(),
  };
  
  await redis.set(
    `feature:${featureKey}`,
    JSON.stringify(state),
    'EX',
    86400 // 24 hours
  );
  
  // Invalidate edge cache if using edge config
  if (process.env.EDGE_CONFIG_ID) {
    await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'update',
              key: `flags.${featureKey}`,
              value: state,
            },
          ],
        }),
      }
    );
  }
  
  console.log(`Feature ${featureKey} disabled`);
}

export async function getFeatureState(featureKey: string): Promise<FeatureState | null> {
  const data = await redis.get(`feature:${featureKey}`);
  return data ? JSON.parse(data) : null;
}
```

## Variants

### Docker Rollback

```bash
#!/bin/bash
# scripts/docker-rollback.sh

# List recent images
docker images --format "{{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | head -5

# Rollback to previous tag
PREV_TAG=$1

if [ -z "$PREV_TAG" ]; then
  echo "Usage: ./rollback.sh <previous-tag>"
  exit 1
fi

# Update docker-compose to use previous image
sed -i "s/image: myapp:.*/image: myapp:${PREV_TAG}/" docker-compose.prod.yml

# Rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Verify health
sleep 10
curl -f http://localhost:3000/api/health || {
  echo "Health check failed, rolling forward"
  docker-compose -f docker-compose.prod.yml up -d --no-deps app
  exit 1
}

echo "Rollback to ${PREV_TAG} successful"
```

## Anti-Patterns

```typescript
// Bad: No version tracking
// Can't identify what to rollback to

// Good: Track deployment versions
const deployment = getDeploymentInfo();

// Bad: Rollback without health verification
await rollback(previousDeployment);
// Hope it works!

// Good: Verify after rollback
await rollback(previousDeployment);
await verifyHealth('/api/health');

// Bad: No notification on rollback
silentlyRollback();

// Good: Alert team on rollback
await rollback(deployment);
await notifySlack(`Rolled back from ${current} to ${previous}`);
```

## Related Skills

- `vercel-deployment` - Deployment configuration
- `health-checks` - Service health monitoring
- `feature-flags` - Quick feature disable
- `observability` - Error monitoring

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial rollback patterns
