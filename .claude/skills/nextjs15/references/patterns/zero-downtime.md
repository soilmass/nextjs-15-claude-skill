---
id: pt-zero-downtime
name: Zero Downtime
version: 2.0.0
layer: L5
category: devops
description: Implement zero-downtime deployments for Next.js 15
tags: [devops, zero, downtime]
composes: []
dependencies: []
formula: "Graceful Shutdown + Health Probes + Rolling Updates = Zero-Downtime Operations"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Zero-Downtime Deployment Pattern

## Overview

Zero-downtime deployment ensures continuous availability during updates. This pattern covers graceful shutdowns, rolling updates, database migrations, connection draining, and health check integration for Next.js 15 applications.

## When to Use

- Running production applications that require 24/7 availability
- Deploying updates without disrupting active user sessions
- Implementing Kubernetes or Docker Swarm rolling updates
- Managing database schema changes in live systems
- Building fault-tolerant deployment pipelines

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │          ZERO-DOWNTIME DEPLOYMENT               │
                    └─────────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │   GRACEFUL    │           │    HEALTH     │           │   ROLLING     │
    │   SHUTDOWN    │           │    CHECKS     │           │   UPDATES     │
    └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
            │                           │                           │
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │• SIGTERM      │           │• Liveness     │           │• maxSurge: 1  │
    │  Handler      │           │• Readiness    │           │• maxUnavail: 0│
    │• Connection   │           │• Startup      │           │• start-first  │
    │  Draining     │           │  Probes       │           │  ordering     │
    │• DB Disconnect│           │• HTTP /health │           │• Health verify│
    └───────────────┘           └───────────────┘           └───────────────┘

                    ┌─────────────────────────────────────────────────┐
                    │        DATABASE MIGRATION STRATEGY               │
                    │  1. Add column (nullable)                       │
                    │  2. Deploy code using both                      │
                    │  3. Backfill data                               │
                    │  4. Deploy code using new only                  │
                    │  5. Drop old column                             │
                    └─────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  Update Flow: New Pod Ready → Drain Old → Health Check → Complete   │
    └─────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Graceful Shutdown Handler

```typescript
// lib/server/graceful-shutdown.ts
import { PrismaClient } from '@prisma/client';
import { redis } from '@/lib/redis';

interface ShutdownHandler {
  name: string;
  handler: () => Promise<void>;
  timeout: number;
}

class GracefulShutdown {
  private handlers: ShutdownHandler[] = [];
  private isShuttingDown = false;
  private shutdownTimeout: number;
  
  constructor(shutdownTimeout = 30000) {
    this.shutdownTimeout = shutdownTimeout;
    this.registerSignals();
  }
  
  register(name: string, handler: () => Promise<void>, timeout = 5000): void {
    this.handlers.push({ name, handler, timeout });
  }
  
  private registerSignals(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;
    
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`Received ${signal}, starting graceful shutdown...`);
        await this.shutdown();
      });
    }
  }
  
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      console.log('Shutdown already in progress');
      return;
    }
    
    this.isShuttingDown = true;
    
    // Create overall timeout
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Shutdown timeout exceeded'));
      }, this.shutdownTimeout);
    });
    
    try {
      await Promise.race([
        this.runHandlers(),
        timeoutPromise,
      ]);
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Graceful shutdown failed:', error);
      process.exit(1);
    }
  }
  
  private async runHandlers(): Promise<void> {
    for (const { name, handler, timeout } of this.handlers) {
      try {
        console.log(`Running shutdown handler: ${name}`);
        
        await Promise.race([
          handler(),
          new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error(`${name} timeout`)), timeout);
          }),
        ]);
        
        console.log(`Handler ${name} completed`);
      } catch (error) {
        console.error(`Handler ${name} failed:`, error);
      }
    }
  }
  
  get shuttingDown(): boolean {
    return this.isShuttingDown;
  }
}

export const gracefulShutdown = new GracefulShutdown();

// Register default handlers
export function initializeGracefulShutdown(
  prisma: PrismaClient,
  redisClient?: typeof redis
): void {
  // Close database connections
  gracefulShutdown.register('prisma', async () => {
    await prisma.$disconnect();
  }, 5000);
  
  // Close Redis connections
  if (redisClient) {
    gracefulShutdown.register('redis', async () => {
      await redisClient.quit();
    }, 3000);
  }
  
  // Add custom cleanup if needed
  gracefulShutdown.register('cleanup', async () => {
    // Clean up temp files, close file handles, etc.
  }, 2000);
}
```

### Health Check with Readiness

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gracefulShutdown } from '@/lib/server/graceful-shutdown';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  ready: boolean;
  checks: {
    database: boolean;
    memory: boolean;
    shuttingDown: boolean;
  };
  uptime: number;
  version: string;
}

export async function GET() {
  // If shutting down, return not ready
  if (gracefulShutdown.shuttingDown) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        ready: false,
        checks: { database: false, memory: false, shuttingDown: true },
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.0.0',
      } satisfies HealthResponse,
      { status: 503 }
    );
  }
  
  // Check database
  let databaseHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseHealthy = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  // Check memory
  const memoryUsage = process.memoryUsage();
  const memoryHealthy = memoryUsage.heapUsed < 500 * 1024 * 1024; // 500MB threshold
  
  const allHealthy = databaseHealthy && memoryHealthy;
  
  const response: HealthResponse = {
    status: allHealthy ? 'healthy' : 'degraded',
    ready: allHealthy,
    checks: {
      database: databaseHealthy,
      memory: memoryHealthy,
      shuttingDown: false,
    },
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.0.0',
  };
  
  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
  });
}

// Kubernetes probes
// app/api/health/live/route.ts
export async function GET() {
  // Liveness: Is the process alive?
  return NextResponse.json({ status: 'alive' });
}

// app/api/health/ready/route.ts
export async function GET() {
  // Readiness: Can it accept traffic?
  if (gracefulShutdown.shuttingDown) {
    return NextResponse.json({ ready: false }, { status: 503 });
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ready: true });
  } catch {
    return NextResponse.json({ ready: false }, { status: 503 });
  }
}
```

### Connection Draining Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory counter for active requests (in production, use Redis)
let activeRequests = 0;
let draining = false;

export function startDraining() {
  draining = true;
}

export function getActiveRequests() {
  return activeRequests;
}

export async function middleware(request: NextRequest) {
  // Check if we're draining
  if (draining) {
    // Allow health checks through
    if (request.nextUrl.pathname.startsWith('/api/health')) {
      return NextResponse.next();
    }
    
    // Return 503 for new requests
    return NextResponse.json(
      { error: 'Server is draining, please retry' },
      { 
        status: 503,
        headers: {
          'Retry-After': '5',
        },
      }
    );
  }
  
  // Track request
  activeRequests++;
  
  const response = NextResponse.next();
  
  // Decrement after response (this is simplified, real implementation would need more work)
  // In practice, use instrumentation or a custom server
  
  return response;
}

// For custom Node.js server
export function createDrainingMiddleware() {
  let activeRequests = 0;
  let draining = false;
  
  return {
    middleware: (req: any, res: any, next: any) => {
      if (draining && !req.url.startsWith('/api/health')) {
        res.status(503).json({ error: 'Server is draining' });
        return;
      }
      
      activeRequests++;
      
      res.on('finish', () => {
        activeRequests--;
      });
      
      next();
    },
    
    startDraining: () => {
      draining = true;
    },
    
    getActiveRequests: () => activeRequests,
    
    waitForDrain: (timeout = 30000): Promise<void> => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const check = () => {
          if (activeRequests === 0) {
            resolve();
            return;
          }
          
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Drain timeout: ${activeRequests} requests still active`));
            return;
          }
          
          setTimeout(check, 100);
        };
        
        check();
      });
    },
  };
}
```

### Zero-Downtime Database Migrations

```typescript
// lib/db/migrations/zero-downtime.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStep {
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  // Is this step safe with both old and new code running?
  backwardCompatible: boolean;
}

// Example: Adding a new column with zero downtime
export const addUserAvatarMigration: MigrationStep[] = [
  {
    // Step 1: Add nullable column (backward compatible)
    name: 'add_avatar_column_nullable',
    backwardCompatible: true,
    up: async () => {
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT
      `;
    },
    down: async () => {
      await prisma.$executeRaw`
        ALTER TABLE "User" DROP COLUMN IF EXISTS "avatar"
      `;
    },
  },
  {
    // Step 2: Backfill data (backward compatible)
    name: 'backfill_avatar_defaults',
    backwardCompatible: true,
    up: async () => {
      // Batch update to avoid locking
      let updated = 0;
      do {
        const result = await prisma.$executeRaw`
          UPDATE "User" 
          SET "avatar" = '/default-avatar.png'
          WHERE "avatar" IS NULL
          LIMIT 1000
        `;
        updated = Number(result);
        
        // Small delay to reduce load
        await new Promise(r => setTimeout(r, 100));
      } while (updated > 0);
    },
    down: async () => {
      // No rollback needed for backfill
    },
  },
  {
    // Step 3: Add NOT NULL constraint (after all code is updated)
    name: 'add_avatar_not_null',
    backwardCompatible: false, // Old code might try to insert NULL
    up: async () => {
      await prisma.$executeRaw`
        ALTER TABLE "User" ALTER COLUMN "avatar" SET NOT NULL
      `;
    },
    down: async () => {
      await prisma.$executeRaw`
        ALTER TABLE "User" ALTER COLUMN "avatar" DROP NOT NULL
      `;
    },
  },
];

// Migration runner
export async function runMigration(
  steps: MigrationStep[],
  options: { stopAtBackwardIncompatible?: boolean } = {}
): Promise<void> {
  for (const step of steps) {
    if (!step.backwardCompatible && options.stopAtBackwardIncompatible) {
      console.log(`Stopping at backward-incompatible step: ${step.name}`);
      break;
    }
    
    console.log(`Running migration step: ${step.name}`);
    
    try {
      await step.up();
      console.log(`Completed: ${step.name}`);
    } catch (error) {
      console.error(`Failed: ${step.name}`, error);
      throw error;
    }
  }
}
```

### Rolling Update Configuration

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Add 1 new pod at a time
      maxUnavailable: 0  # Never remove old pods until new is ready
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      terminationGracePeriodSeconds: 60  # Time for graceful shutdown
      containers:
        - name: nextjs
          image: myapp:latest
          ports:
            - containerPort: 3000
          
          # Readiness probe - when to start sending traffic
          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3
          
          # Liveness probe - when to restart the container
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
            failureThreshold: 3
          
          # Startup probe - for slow-starting containers
          startupProbe:
            httpGet:
              path: /api/health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30  # 30 * 5 = 150 seconds max startup
          
          lifecycle:
            preStop:
              exec:
                # Wait for load balancer to remove this pod
                command: ["sh", "-c", "sleep 10"]
          
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

### Docker Compose Rolling Update

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first  # Start new before stopping old
      rollback_config:
        parallelism: 1
        delay: 10s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/ready"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
    stop_grace_period: 30s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - app
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

### Nginx Configuration for Zero Downtime

```nginx
# nginx.conf
upstream nextjs {
    # Health check support
    zone nextjs_zone 64k;
    
    server app:3000 max_fails=3 fail_timeout=30s;
    
    # Keep connections alive
    keepalive 32;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Connection draining
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Retry on failure
        proxy_next_upstream error timeout http_503;
        proxy_next_upstream_tries 3;
    }
    
    # Health check endpoint (nginx plus or openresty)
    location /health {
        proxy_pass http://nextjs/api/health;
        proxy_connect_timeout 1s;
        proxy_read_timeout 1s;
    }
}
```

### Vercel Zero-Downtime (Automatic)

```typescript
// vercel.json
{
  "buildCommand": "npm run build",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    }
  ]
}

// Vercel handles zero-downtime automatically:
// 1. Builds new deployment
// 2. Runs health checks
// 3. Atomically switches traffic
// 4. Keeps old deployment for instant rollback
```

### GitHub Actions Zero-Downtime Deploy

```yaml
# .github/workflows/zero-downtime-deploy.yml
name: Zero-Downtime Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/app:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/app:${{ github.sha }}
      
      - name: Run backward-compatible migrations
        run: |
          kubectl run migration-${{ github.sha }} \
            --image=${{ secrets.REGISTRY }}/app:${{ github.sha }} \
            --restart=Never \
            --command -- npm run migrate:safe
          kubectl wait --for=condition=complete job/migration-${{ github.sha }}
      
      - name: Rolling update
        run: |
          kubectl set image deployment/nextjs-app \
            nextjs=${{ secrets.REGISTRY }}/app:${{ github.sha }}
          kubectl rollout status deployment/nextjs-app --timeout=5m
      
      - name: Verify health
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s https://${{ secrets.DOMAIN }}/api/health | jq -r '.status')
            if [ "$STATUS" = "healthy" ]; then
              echo "Deployment healthy!"
              exit 0
            fi
            sleep 5
          done
          echo "Health check failed"
          kubectl rollout undo deployment/nextjs-app
          exit 1
      
      - name: Run final migrations (if needed)
        if: success()
        run: |
          # After all pods are updated, run backward-incompatible migrations
          kubectl run migration-final-${{ github.sha }} \
            --image=${{ secrets.REGISTRY }}/app:${{ github.sha }} \
            --restart=Never \
            --command -- npm run migrate:finalize
```

## Variants

### PM2 Zero-Downtime

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    
    // Zero-downtime reload
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // Graceful shutdown
    shutdown_with_message: true,
    
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};

// In your app, signal ready:
// process.send?.('ready');
```

## Anti-Patterns

```typescript
// Bad: No health checks
// Load balancer sends traffic to broken pods

// Good: Proper readiness probe
app.get('/api/health/ready', async (req, res) => {
  const healthy = await checkDependencies();
  res.status(healthy ? 200 : 503).json({ ready: healthy });
});

// Bad: Immediate shutdown
process.on('SIGTERM', () => process.exit(0));

// Good: Graceful shutdown with draining
process.on('SIGTERM', async () => {
  await stopAcceptingRequests();
  await waitForActiveRequests();
  await closeConnections();
  process.exit(0);
});

// Bad: Breaking database changes
ALTER TABLE users DROP COLUMN email; // Old code will crash!

// Good: Backward-compatible migrations
// Step 1: Add new column
// Step 2: Deploy code that uses both
// Step 3: Migrate data
// Step 4: Deploy code that uses only new
// Step 5: Drop old column
```

## Related Skills

- `health-checks` - Service health monitoring
- `blue-green` - Alternative deployment strategy
- `canary` - Gradual rollout
- `rollback` - Quick recovery

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial zero-downtime deployment pattern
