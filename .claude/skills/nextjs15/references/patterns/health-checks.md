---
id: pt-health-checks
name: Health Checks
version: 1.0.0
layer: L5
category: observability
description: Implement health check endpoints for monitoring service status and dependencies
tags: [health, monitoring, observability, kubernetes, docker, next15, react19]
composes: []
dependencies: []
formula: "HealthChecks = Liveness + Readiness + DependencyChecks + StatusAggregation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Health Checks

## When to Use

- When deploying to Kubernetes or container orchestrators
- For load balancer health verification
- When implementing circuit breakers
- For monitoring service dependencies
- When building status pages

## Overview

This pattern implements health check endpoints following Kubernetes conventions with liveness, readiness, and startup probes. It covers dependency checking, status aggregation, and monitoring integration.

## Health Check Types

```typescript
// lib/health/types.ts

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  components: ComponentHealth[];
}
```

## Health Check Functions

```typescript
// lib/health/checks.ts
import { prisma } from "@/lib/db";
import { Redis } from "ioredis";
import { ComponentHealth, HealthStatus } from "./types";

const redis = new Redis(process.env.REDIS_URL!);
const startTime = Date.now();

export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

// Database health check
export async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: "database",
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "database",
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

// Redis health check
export async function checkRedis(): Promise<ComponentHealth> {
  const start = Date.now();

  try {
    await redis.ping();
    return {
      name: "redis",
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "redis",
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Redis connection failed",
    };
  }
}

// External API health check
export async function checkExternalAPI(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<ComponentHealth> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return {
      name,
      status: response.ok ? "healthy" : "degraded",
      latency: Date.now() - start,
      details: { statusCode: response.status },
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      name,
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "External API unreachable",
    };
  }
}

// Memory usage check
export function checkMemory(): ComponentHealth {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);

  let status: HealthStatus = "healthy";
  if (percentage > 90) status = "unhealthy";
  else if (percentage > 75) status = "degraded";

  return {
    name: "memory",
    status,
    details: {
      heapUsedMB,
      heapTotalMB,
      percentage,
    },
  };
}

// Disk space check (for environments with fs access)
export async function checkDiskSpace(): Promise<ComponentHealth> {
  try {
    const { execSync } = await import("child_process");
    const output = execSync("df -h / | tail -1").toString();
    const [, , , , usePercent] = output.split(/\s+/);
    const percentage = parseInt(usePercent);

    let status: HealthStatus = "healthy";
    if (percentage > 90) status = "unhealthy";
    else if (percentage > 80) status = "degraded";

    return {
      name: "disk",
      status,
      details: { usagePercent: percentage },
    };
  } catch {
    return {
      name: "disk",
      status: "healthy",
      message: "Disk check not available",
    };
  }
}
```

## Health Check Aggregator

```typescript
// lib/health/aggregator.ts
import { HealthCheckResult, ComponentHealth, HealthStatus } from "./types";
import {
  checkDatabase,
  checkRedis,
  checkExternalAPI,
  checkMemory,
  getUptime,
} from "./checks";

export async function runHealthChecks(): Promise<HealthCheckResult> {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkMemory(),
    checkExternalAPI("stripe", "https://api.stripe.com"),
  ]);

  const status = aggregateStatus(checks);

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: getUptime(),
    components: checks,
  };
}

function aggregateStatus(components: ComponentHealth[]): HealthStatus {
  const hasUnhealthy = components.some((c) => c.status === "unhealthy");
  const hasDegraded = components.some((c) => c.status === "degraded");

  if (hasUnhealthy) return "unhealthy";
  if (hasDegraded) return "degraded";
  return "healthy";
}

// Liveness check - just verifies the process is running
export async function runLivenessCheck(): Promise<{ status: HealthStatus }> {
  return { status: "healthy" };
}

// Readiness check - verifies the app can handle requests
export async function runReadinessCheck(): Promise<HealthCheckResult> {
  const criticalChecks = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const status = aggregateStatus(criticalChecks);

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: getUptime(),
    components: criticalChecks,
  };
}
```

## Health Check API Routes

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { runHealthChecks } from "@/lib/health/aggregator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const health = await runHealthChecks();

  const statusCode = health.status === "healthy" ? 200 :
                     health.status === "degraded" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

```typescript
// app/api/health/live/route.ts
import { NextResponse } from "next/server";
import { runLivenessCheck } from "@/lib/health/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runLivenessCheck();
  return NextResponse.json(result);
}
```

```typescript
// app/api/health/ready/route.ts
import { NextResponse } from "next/server";
import { runReadinessCheck } from "@/lib/health/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await runReadinessCheck();
  const statusCode = health.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(health, { status: statusCode });
}
```

## Kubernetes Configuration

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: your-app:latest
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /api/health/ready
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 30
```

## Health Dashboard Component

```typescript
// components/admin/health-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import type { HealthCheckResult, ComponentHealth } from "@/lib/health/types";

const statusIcons = {
  healthy: <CheckCircle className="h-4 w-4 text-green-500" />,
  degraded: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  unhealthy: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors = {
  healthy: "bg-green-100 text-green-800",
  degraded: "bg-yellow-100 text-yellow-800",
  unhealthy: "bg-red-100 text-red-800",
};

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error("Failed to fetch health:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health) {
    return <div>Loading health status...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">System Health</h2>
          <Badge className={statusColors[health.status]}>
            {health.status.toUpperCase()}
          </Badge>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-full"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {health.components.map((component) => (
          <ComponentCard key={component.name} component={component} />
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Version: {health.version}</p>
        <p>Uptime: {formatUptime(health.uptime)}</p>
        <p>Last checked: {new Date(health.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}

function ComponentCard({ component }: { component: ComponentHealth }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusIcons[component.status]}
          <span className="font-medium capitalize">{component.name}</span>
        </div>
        {component.latency && (
          <span className="text-sm text-muted-foreground">
            {component.latency}ms
          </span>
        )}
      </div>
      {component.message && (
        <p className="text-sm text-muted-foreground mt-2">{component.message}</p>
      )}
    </Card>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
```

## Anti-patterns

### Don't Include Sensitive Data in Health Responses

```typescript
// BAD - Exposes credentials
return {
  status: "healthy",
  database: {
    connectionString: process.env.DATABASE_URL,
  },
};

// GOOD - Only include status
return {
  status: "healthy",
  database: {
    connected: true,
    latency: 5,
  },
};
```

## Related Patterns

- [logging](./logging.md)
- [alerting](./alerting.md)
- [synthetic-monitoring](./synthetic-monitoring.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Liveness and readiness probes
- Dependency health checks
- Health dashboard
- Kubernetes configuration
