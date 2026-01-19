---
id: pt-uptime-monitoring
name: Service Uptime Monitoring
version: 1.0.0
layer: L5
category: monitoring
description: Service uptime monitoring and health checks for Next.js applications
tags: [uptime, monitoring, health-checks, availability, next15]
composes:
  - ../molecules/card.md
  - ../molecules/badge.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: Health Checks + Status Page + Alerting = Uptime Monitoring System
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Service Uptime Monitoring

## When to Use

- **Service availability**: Monitoring critical services and endpoints
- **Status pages**: Public-facing status information for users
- **Incident tracking**: Recording and communicating outages
- **SLA compliance**: Ensuring uptime commitments are met

**Avoid when**: Using external monitoring services exclusively (Pingdom, UptimeRobot).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Uptime Monitoring Architecture                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Monitor Service                                       │  │
│  │  ├─ Health Checks: Periodic endpoint testing         │  │
│  │  ├─ Incident Manager: Outage tracking               │  │
│  │  └─ Status Calculator: Uptime percentages           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Check      │     │ Status       │     │ Incident    │   │
│  │ Scheduler  │     │ Page         │     │ Alerts      │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Types and Configuration

```typescript
// lib/monitoring/types.ts
export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage';

export interface MonitoredService {
  id: string;
  name: string;
  url: string;
  checkInterval: number; // seconds
  timeout: number; // milliseconds
  expectedStatus?: number;
  expectedBody?: string;
}

export interface HealthCheck {
  id: string;
  serviceId: string;
  status: 'up' | 'down';
  responseTime: number;
  statusCode?: number;
  error?: string;
  checkedAt: Date;
}

export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  startedAt: Date;
  resolvedAt?: Date;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status: Incident['status'];
  createdAt: Date;
}

export interface UptimeStats {
  serviceId: string;
  period: 'day' | 'week' | 'month';
  uptime: number;
  totalChecks: number;
  successfulChecks: number;
  averageResponseTime: number;
}
```

## Monitor Service

```typescript
// lib/monitoring/service.ts
import { db } from '@/lib/db';
import { MonitoredService, HealthCheck, Incident, UptimeStats, ServiceStatus } from './types';

export class MonitorService {
  async checkService(service: MonitoredService): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: 'up' | 'down' = 'down';
    let statusCode: number | undefined;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), service.timeout);

      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'UptimeMonitor/1.0' },
      });

      clearTimeout(timeout);
      statusCode = response.status;

      const expectedStatus = service.expectedStatus || 200;
      if (response.status === expectedStatus) {
        if (service.expectedBody) {
          const body = await response.text();
          status = body.includes(service.expectedBody) ? 'up' : 'down';
        } else {
          status = 'up';
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const responseTime = Date.now() - startTime;

    const check = await db.healthCheck.create({
      data: {
        serviceId: service.id,
        status,
        responseTime,
        statusCode,
        error,
        checkedAt: new Date(),
      },
    });

    // Handle status changes
    const previousCheck = await db.healthCheck.findFirst({
      where: { serviceId: service.id, id: { not: check.id } },
      orderBy: { checkedAt: 'desc' },
    });

    if (previousCheck && previousCheck.status !== status) {
      await this.handleStatusChange(service, previousCheck.status, status);
    }

    return check;
  }

  private async handleStatusChange(
    service: MonitoredService,
    previousStatus: 'up' | 'down',
    newStatus: 'up' | 'down'
  ) {
    if (newStatus === 'down') {
      // Create incident
      await db.incident.create({
        data: {
          serviceId: service.id,
          title: `${service.name} is experiencing issues`,
          status: 'investigating',
          severity: 'major',
          startedAt: new Date(),
          updates: {
            create: {
              message: 'We are investigating reports of issues.',
              status: 'investigating',
            },
          },
        },
      });

      // Send alert (implement your alerting logic)
      await this.sendAlert(service, 'down');
    } else {
      // Resolve active incident
      const activeIncident = await db.incident.findFirst({
        where: { serviceId: service.id, resolvedAt: null },
      });

      if (activeIncident) {
        await db.incident.update({
          where: { id: activeIncident.id },
          data: {
            status: 'resolved',
            resolvedAt: new Date(),
            updates: {
              create: {
                message: 'The issue has been resolved.',
                status: 'resolved',
              },
            },
          },
        });
      }
    }
  }

  private async sendAlert(service: MonitoredService, status: 'up' | 'down') {
    // Implement your alerting logic (email, Slack, PagerDuty, etc.)
    console.log(`Alert: ${service.name} is ${status}`);
  }

  async getUptimeStats(serviceId: string, period: 'day' | 'week' | 'month'): Promise<UptimeStats> {
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    const checks = await db.healthCheck.findMany({
      where: { serviceId, checkedAt: { gte: startDate } },
    });

    const totalChecks = checks.length;
    const successfulChecks = checks.filter((c) => c.status === 'up').length;
    const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;
    const averageResponseTime =
      checks.length > 0
        ? checks.reduce((sum, c) => sum + c.responseTime, 0) / checks.length
        : 0;

    return { serviceId, period, uptime, totalChecks, successfulChecks, averageResponseTime };
  }

  async getCurrentStatus(serviceId: string): Promise<ServiceStatus> {
    const recentChecks = await db.healthCheck.findMany({
      where: { serviceId },
      orderBy: { checkedAt: 'desc' },
      take: 5,
    });

    if (recentChecks.length === 0) return 'operational';

    const downCount = recentChecks.filter((c) => c.status === 'down').length;

    if (downCount === recentChecks.length) return 'major_outage';
    if (downCount >= 3) return 'partial_outage';
    if (downCount >= 1) return 'degraded';
    return 'operational';
  }
}

export const monitorService = new MonitorService();
```

## API Routes

```typescript
// app/api/status/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { monitorService } from '@/lib/monitoring/service';

export async function GET() {
  const services = await db.monitoredService.findMany();

  const statuses = await Promise.all(
    services.map(async (service) => ({
      id: service.id,
      name: service.name,
      status: await monitorService.getCurrentStatus(service.id),
      uptime: await monitorService.getUptimeStats(service.id, 'month'),
    }))
  );

  const activeIncidents = await db.incident.findMany({
    where: { resolvedAt: null },
    include: { updates: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });

  return NextResponse.json({ services: statuses, activeIncidents });
}

// app/api/health/route.ts - Internal health check endpoint
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

## Status Page Component

```typescript
// components/monitoring/status-page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, XCircle, MinusCircle } from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  uptime: { uptime: number; averageResponseTime: number };
}

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  updates: { message: string; createdAt: string }[];
}

const statusConfig = {
  operational: { icon: CheckCircle, color: 'text-green-500', label: 'Operational' },
  degraded: { icon: MinusCircle, color: 'text-yellow-500', label: 'Degraded' },
  partial_outage: { icon: AlertCircle, color: 'text-orange-500', label: 'Partial Outage' },
  major_outage: { icon: XCircle, color: 'text-red-500', label: 'Major Outage' },
};

export function StatusPage() {
  const [data, setData] = useState<{ services: ServiceStatus[]; activeIncidents: Incident[] } | null>(null);

  useEffect(() => {
    const fetchStatus = () => fetch('/api/status').then((r) => r.json()).then(setData);
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Loading...</div>;

  const overallStatus = data.services.every((s) => s.status === 'operational')
    ? 'operational'
    : data.services.some((s) => s.status === 'major_outage')
    ? 'major_outage'
    : 'degraded';

  const OverallIcon = statusConfig[overallStatus].icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <OverallIcon className={`h-8 w-8 ${statusConfig[overallStatus].color}`} />
            <div>
              <h2 className="text-xl font-semibold">{statusConfig[overallStatus].label}</h2>
              <p className="text-muted-foreground">All systems are running smoothly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.activeIncidents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Active Incidents</h3>
          {data.activeIncidents.map((incident) => (
            <Alert key={incident.id} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{incident.title}</AlertTitle>
              <AlertDescription>
                {incident.updates[0]?.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Services</h3>
        {data.services.map((service) => {
          const config = statusConfig[service.status];
          const Icon = config.icon;
          return (
            <Card key={service.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {service.uptime.uptime.toFixed(2)}% uptime
                  </span>
                  <Badge variant="secondary">
                    {service.uptime.averageResponseTime.toFixed(0)}ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

## Related Patterns

- [sla-tracking](./sla-tracking.md)
- [alerting](./alerting.md)
- [logging](./logging.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Health check service
- Incident tracking
- Status page component
