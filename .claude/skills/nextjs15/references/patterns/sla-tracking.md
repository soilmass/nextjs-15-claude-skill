---
id: pt-sla-tracking
name: SLA Monitoring and Tracking
version: 1.1.0
layer: L5
category: monitoring
description: Service Level Agreement monitoring and tracking for Next.js applications with real-time dashboards, alerting, and compliance reporting
tags: [sla, monitoring, metrics, uptime, performance, next15, observability, alerts]
composes:
  - ../molecules/card.md
  - ../molecules/progress-bar.md
  - ../molecules/badge.md
  - ../organisms/data-table.md
dependencies:
  prisma: "^6.0.0"
formula: Metrics Collection + Threshold Alerts + Dashboard = SLA Compliance Monitoring
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# SLA Monitoring and Tracking

## Overview

Service Level Agreements (SLAs) are contractual commitments that define the expected level of service between a provider and its customers. This pattern provides a comprehensive implementation for tracking, monitoring, and reporting SLA compliance within Next.js applications. It enables organizations to measure key metrics like uptime, response time, and error rates against defined targets.

The implementation uses a three-tier architecture: a metrics collection layer that gathers data from various sources (health checks, application monitoring, error tracking), a processing layer that calculates compliance percentages and detects threshold breaches, and a presentation layer with real-time dashboards and automated reporting. The system supports multiple SLA types including availability SLAs (99.9% uptime), performance SLAs (P95 response time under 200ms), and quality SLAs (error rate below 0.1%).

This pattern is essential for B2B SaaS applications where SLA compliance affects customer contracts, enterprise applications with internal service commitments, and any system where service reliability directly impacts business outcomes. The implementation includes proactive alerting to notify teams before SLA breaches occur, historical trend analysis for capacity planning, and exportable compliance reports for stakeholder communication.

## When to Use

- **Customer-facing SLA commitments**: When your contracts with customers include specific uptime, response time, or availability guarantees that require tracking and reporting
- **Internal service monitoring**: For tracking reliability of internal services that other teams depend on, ensuring cross-team accountability
- **Regulatory compliance**: When industry regulations require documented proof of service availability and performance (healthcare, finance, government)
- **Multi-tenant platforms**: To provide individual customers with visibility into their specific SLA metrics and compliance status
- **Incident management integration**: When you need to correlate SLA impacts with incident timelines for root cause analysis and post-mortems
- **Capacity planning**: To identify trends in service performance that inform infrastructure scaling decisions

## When NOT to Use

- **Early-stage MVPs**: If you don't have formal SLA commitments yet, focus on basic monitoring first before implementing full SLA tracking
- **Third-party monitoring only**: If you're using comprehensive external monitoring tools (Datadog, New Relic) that already provide SLA tracking, avoid duplicating effort
- **Low-stakes internal tools**: For internal tools where occasional downtime has minimal business impact, simpler uptime monitoring may suffice
- **Real-time only needs**: If you only need current status without historical tracking or compliance reporting, a simpler health check dashboard would be more appropriate

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ SLA Monitoring Architecture                                                       │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Data Collection Layer                                                        │ │
│  │                                                                              │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │ │
│  │  │ Health      │   │ APM         │   │ Error       │   │ Custom      │      │ │
│  │  │ Checks      │   │ Metrics     │   │ Tracking    │   │ Metrics     │      │ │
│  │  │             │   │             │   │             │   │             │      │ │
│  │  │ - Endpoint  │   │ - P50/P95   │   │ - 4xx/5xx   │   │ - Business  │      │ │
│  │  │   pings     │   │   latency   │   │   rates     │   │   KPIs      │      │ │
│  │  │ - DB conn   │   │ - TTFB      │   │ - Exception │   │ - Queue     │      │ │
│  │  │ - Service   │   │ - Throughput│   │   counts    │   │   depths    │      │ │
│  │  │   deps      │   │             │   │             │   │             │      │ │
│  │  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘      │ │
│  │         │                 │                 │                 │              │ │
│  └─────────┼─────────────────┼─────────────────┼─────────────────┼──────────────┘ │
│            │                 │                 │                 │                │
│            ▼                 ▼                 ▼                 ▼                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Processing Layer                                                             │ │
│  │                                                                              │ │
│  │  ┌───────────────────────┐   ┌───────────────────────┐                      │ │
│  │  │ Metrics Aggregator    │   │ SLA Calculator        │                      │ │
│  │  │                       │   │                       │                      │ │
│  │  │ - Time-series storage │   │ - Compliance %        │                      │ │
│  │  │ - Rolling windows     │   │ - Remaining budget    │                      │ │
│  │  │ - Percentile calc     │   │ - Trend analysis      │                      │ │
│  │  └───────────┬───────────┘   └───────────┬───────────┘                      │ │
│  │              │                           │                                   │ │
│  │              ▼                           ▼                                   │ │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Alert Engine                                                          │  │ │
│  │  │  ├─ Warning: 95% of error budget consumed                            │  │ │
│  │  │  ├─ Critical: SLA breach imminent (< 1 hour remaining)               │  │ │
│  │  │  └─ Breach: SLA target not met for period                            │  │ │
│  │  └───────────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                        │
│                                          ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Presentation Layer                                                           │ │
│  │                                                                              │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │ │
│  │  │ Real-time      │  │ Historical     │  │ Compliance     │                 │ │
│  │  │ Dashboard      │  │ Trends         │  │ Reports        │                 │ │
│  │  │                │  │                │  │                │                 │ │
│  │  │ - Current %    │  │ - 7/30/90 day  │  │ - PDF export   │                 │ │
│  │  │ - Status       │  │ - Incident     │  │ - Scheduled    │                 │ │
│  │  │ - Incidents    │  │   correlation  │  │   delivery     │                 │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘                 │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### SLA Configuration Types

```typescript
// lib/sla/types.ts
export type SLAMetricType =
  | 'uptime'
  | 'latency_p50'
  | 'latency_p95'
  | 'latency_p99'
  | 'error_rate'
  | 'throughput'
  | 'availability';

export type SLAPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type SLASeverity = 'critical' | 'major' | 'minor' | 'warning';

export interface SLATarget {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  metric: SLAMetricType;
  target: number;
  unit: 'percent' | 'milliseconds' | 'requests_per_second';
  period: SLAPeriod;
  threshold: {
    warning: number;   // e.g., 95% of budget consumed
    critical: number;  // e.g., 99% of budget consumed
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAMeasurement {
  id: string;
  slaId: string;
  timestamp: Date;
  value: number;
  isCompliant: boolean;
  metadata?: Record<string, unknown>;
}

export interface SLAReport {
  slaId: string;
  slaName: string;
  serviceName: string;
  period: { start: Date; end: Date };
  target: number;
  actual: number;
  compliance: number;
  errorBudget: {
    total: number;       // Total allowed downtime/errors
    consumed: number;    // Used budget
    remaining: number;   // Remaining budget
    percentUsed: number; // Percentage of budget used
  };
  incidents: Incident[];
  trend: 'improving' | 'stable' | 'degrading';
  previousPeriodCompliance?: number;
}

export interface Incident {
  id: string;
  slaId: string;
  serviceId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  severity: SLASeverity;
  title: string;
  description: string;
  rootCause?: string;
  resolution?: string;
  impactedUsers?: number;
  timeline: IncidentTimelineEntry[];
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  actor: string;
  notes?: string;
}

export interface SLAAlert {
  id: string;
  slaId: string;
  type: 'warning' | 'critical' | 'breach';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface ErrorBudgetPolicy {
  slaId: string;
  burnRateThresholds: {
    fast: number;   // e.g., 14.4x (1-hour window)
    slow: number;   // e.g., 6x (6-hour window)
  };
  alertChannels: ('email' | 'slack' | 'pagerduty' | 'webhook')[];
  autoEscalation: boolean;
  escalationDelay: number; // minutes
}
```

### SLA Service Implementation

```typescript
// lib/sla/service.ts
import { db } from '@/lib/db';
import {
  SLATarget,
  SLAMeasurement,
  SLAReport,
  Incident,
  SLAMetricType,
  SLAPeriod
} from './types';
import { sendAlert } from '@/lib/notifications';

export class SLAService {
  /**
   * Get all active SLA targets
   */
  async getSLATargets(serviceId?: string): Promise<SLATarget[]> {
    return db.slaTarget.findMany({
      where: {
        active: true,
        ...(serviceId && { serviceId })
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single SLA target by ID
   */
  async getSLATarget(id: string): Promise<SLATarget | null> {
    return db.slaTarget.findUnique({ where: { id } });
  }

  /**
   * Create a new SLA target
   */
  async createSLATarget(data: Omit<SLATarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<SLATarget> {
    return db.slaTarget.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Record a measurement for an SLA
   */
  async recordMeasurement(
    slaId: string,
    value: number,
    metadata?: Record<string, unknown>
  ): Promise<SLAMeasurement> {
    const target = await db.slaTarget.findUnique({ where: { id: slaId } });
    if (!target) throw new Error('SLA target not found');

    const isCompliant = this.checkCompliance(target, value);

    const measurement = await db.slaMeasurement.create({
      data: {
        slaId,
        value,
        isCompliant,
        metadata,
        timestamp: new Date(),
      },
    });

    // Check if we need to trigger alerts
    await this.checkAndTriggerAlerts(slaId);

    return measurement;
  }

  /**
   * Check if a value meets the SLA target
   */
  private checkCompliance(target: SLATarget, value: number): boolean {
    switch (target.metric) {
      case 'uptime':
      case 'availability':
        // Higher is better
        return value >= target.target;
      case 'latency_p50':
      case 'latency_p95':
      case 'latency_p99':
        // Lower is better
        return value <= target.target;
      case 'error_rate':
        // Lower is better
        return value <= target.target;
      case 'throughput':
        // Higher is better
        return value >= target.target;
      default:
        return false;
    }
  }

  /**
   * Calculate uptime percentage for a service
   */
  async calculateUptime(
    serviceId: string,
    period: { start: Date; end: Date }
  ): Promise<number> {
    const incidents = await db.incident.findMany({
      where: {
        serviceId,
        startTime: { gte: period.start },
        OR: [
          { endTime: { lte: period.end } },
          { endTime: null },
        ],
      },
    });

    const totalMinutes = (period.end.getTime() - period.start.getTime()) / 60000;

    const downtimeMinutes = incidents.reduce((sum, inc) => {
      const incStart = Math.max(inc.startTime.getTime(), period.start.getTime());
      const incEnd = inc.endTime
        ? Math.min(inc.endTime.getTime(), period.end.getTime())
        : period.end.getTime();
      return sum + (incEnd - incStart) / 60000;
    }, 0);

    return ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;
  }

  /**
   * Calculate error budget status
   */
  async calculateErrorBudget(
    slaId: string,
    period: { start: Date; end: Date }
  ): Promise<SLAReport['errorBudget']> {
    const target = await db.slaTarget.findUnique({ where: { id: slaId } });
    if (!target) throw new Error('SLA target not found');

    const totalMinutes = (period.end.getTime() - period.start.getTime()) / 60000;

    // For 99.9% uptime, error budget is 0.1% of total time
    const errorBudgetPercent = 100 - target.target;
    const totalBudgetMinutes = (errorBudgetPercent / 100) * totalMinutes;

    // Get actual downtime
    const measurements = await db.slaMeasurement.findMany({
      where: {
        slaId,
        timestamp: { gte: period.start, lte: period.end },
        isCompliant: false,
      },
    });

    // Each non-compliant measurement represents ~1 minute of "downtime"
    const consumedMinutes = measurements.length;

    return {
      total: totalBudgetMinutes,
      consumed: consumedMinutes,
      remaining: Math.max(0, totalBudgetMinutes - consumedMinutes),
      percentUsed: (consumedMinutes / totalBudgetMinutes) * 100,
    };
  }

  /**
   * Generate comprehensive SLA report
   */
  async generateReport(
    slaId: string,
    period: { start: Date; end: Date }
  ): Promise<SLAReport> {
    const target = await db.slaTarget.findUnique({
      where: { id: slaId },
      include: { service: true }
    });
    if (!target) throw new Error('SLA target not found');

    const measurements = await db.slaMeasurement.findMany({
      where: {
        slaId,
        timestamp: { gte: period.start, lte: period.end },
      },
      orderBy: { timestamp: 'asc' },
    });

    const incidents = await db.incident.findMany({
      where: {
        slaId,
        startTime: { gte: period.start, lte: period.end },
      },
      include: { timeline: true },
      orderBy: { startTime: 'desc' },
    });

    // Calculate actual compliance
    const actual = measurements.length > 0
      ? measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length
      : target.target;

    const compliantCount = measurements.filter((m) => m.isCompliant).length;
    const compliance = measurements.length > 0
      ? (compliantCount / measurements.length) * 100
      : 100;

    // Calculate error budget
    const errorBudget = await this.calculateErrorBudget(slaId, period);

    // Get previous period for trend analysis
    const periodLength = period.end.getTime() - period.start.getTime();
    const previousPeriod = {
      start: new Date(period.start.getTime() - periodLength),
      end: period.start,
    };

    const previousReport = await this.getComplianceForPeriod(slaId, previousPeriod);

    // Determine trend
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (previousReport !== null) {
      const diff = compliance - previousReport;
      if (diff > 1) trend = 'improving';
      else if (diff < -1) trend = 'degrading';
    }

    return {
      slaId,
      slaName: target.name,
      serviceName: target.service.name,
      period,
      target: target.target,
      actual,
      compliance,
      errorBudget,
      incidents,
      trend,
      previousPeriodCompliance: previousReport ?? undefined,
    };
  }

  /**
   * Get compliance percentage for a specific period
   */
  private async getComplianceForPeriod(
    slaId: string,
    period: { start: Date; end: Date }
  ): Promise<number | null> {
    const measurements = await db.slaMeasurement.findMany({
      where: {
        slaId,
        timestamp: { gte: period.start, lte: period.end },
      },
    });

    if (measurements.length === 0) return null;

    const compliantCount = measurements.filter((m) => m.isCompliant).length;
    return (compliantCount / measurements.length) * 100;
  }

  /**
   * Check thresholds and trigger alerts if needed
   */
  private async checkAndTriggerAlerts(slaId: string): Promise<void> {
    const target = await db.slaTarget.findUnique({ where: { id: slaId } });
    if (!target) return;

    // Calculate current period error budget
    const now = new Date();
    const periodStart = this.getPeriodStart(now, target.period);
    const errorBudget = await this.calculateErrorBudget(slaId, {
      start: periodStart,
      end: now,
    });

    // Check warning threshold
    if (errorBudget.percentUsed >= target.threshold.warning &&
        errorBudget.percentUsed < target.threshold.critical) {
      await this.createAlert(slaId, 'warning',
        `Warning: ${errorBudget.percentUsed.toFixed(1)}% of error budget consumed for ${target.name}`
      );
    }

    // Check critical threshold
    if (errorBudget.percentUsed >= target.threshold.critical) {
      await this.createAlert(slaId, 'critical',
        `Critical: ${errorBudget.percentUsed.toFixed(1)}% of error budget consumed for ${target.name}. SLA breach imminent.`
      );
    }

    // Check for actual breach
    if (errorBudget.remaining <= 0) {
      await this.createAlert(slaId, 'breach',
        `SLA Breach: Error budget exhausted for ${target.name}. SLA target of ${target.target}% not met.`
      );
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(
    slaId: string,
    type: 'warning' | 'critical' | 'breach',
    message: string
  ): Promise<void> {
    // Check if similar alert exists in last hour
    const recentAlert = await db.slaAlert.findFirst({
      where: {
        slaId,
        type,
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentAlert) return; // Don't spam alerts

    await db.slaAlert.create({
      data: {
        slaId,
        type,
        message,
        timestamp: new Date(),
        acknowledged: false,
      },
    });

    // Send notification
    await sendAlert({
      type,
      message,
      slaId,
      timestamp: new Date(),
    });
  }

  /**
   * Get the start of the current period
   */
  private getPeriodStart(date: Date, period: SLAPeriod): Date {
    const d = new Date(date);

    switch (period) {
      case 'hourly':
        d.setMinutes(0, 0, 0);
        break;
      case 'daily':
        d.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        break;
      case 'monthly':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        break;
      case 'quarterly':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        d.setMonth(Math.floor(d.getMonth() / 3) * 3);
        break;
      case 'yearly':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        d.setMonth(0);
        break;
    }

    return d;
  }

  /**
   * Record an incident
   */
  async createIncident(data: Omit<Incident, 'id' | 'timeline'>): Promise<Incident> {
    return db.incident.create({
      data: {
        ...data,
        timeline: {
          create: [{
            timestamp: new Date(),
            action: 'Incident created',
            actor: 'System',
          }],
        },
      },
      include: { timeline: true },
    });
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(
    incidentId: string,
    resolution: string,
    actor: string
  ): Promise<Incident> {
    const incident = await db.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new Error('Incident not found');

    const endTime = new Date();
    const duration = (endTime.getTime() - incident.startTime.getTime()) / 60000;

    return db.incident.update({
      where: { id: incidentId },
      data: {
        endTime,
        duration,
        resolution,
        timeline: {
          create: {
            timestamp: endTime,
            action: 'Incident resolved',
            actor,
            notes: resolution,
          },
        },
      },
      include: { timeline: true },
    });
  }
}

export const slaService = new SLAService();
```

### API Routes

```typescript
// app/api/sla/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { slaService } from '@/lib/sla/service';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;

  const start = new Date(
    searchParams.get('start') || Date.now() - 30 * 24 * 60 * 60 * 1000
  );
  const end = new Date(searchParams.get('end') || Date.now());

  try {
    const report = await slaService.generateReport(id, { start, end });
    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to generate SLA report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/sla/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { slaService } from '@/lib/sla/service';
import { z } from 'zod';

const metricsSchema = z.object({
  slaId: z.string(),
  value: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  // This endpoint is typically called by internal monitoring systems
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.METRICS_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slaId, value, metadata } = metricsSchema.parse(body);

    const measurement = await slaService.recordMeasurement(slaId, value, metadata);
    return NextResponse.json(measurement);
  } catch (error) {
    console.error('Failed to record metric:', error);
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 400 }
    );
  }
}
```

```typescript
// app/api/sla/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { slaService } from '@/lib/sla/service';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const incidentSchema = z.object({
  slaId: z.string(),
  serviceId: z.string(),
  severity: z.enum(['critical', 'major', 'minor', 'warning']),
  title: z.string(),
  description: z.string(),
  impactedUsers: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = incidentSchema.parse(body);

    const incident = await slaService.createIncident({
      ...data,
      startTime: new Date(),
      duration: 0,
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Failed to create incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 400 }
    );
  }
}
```

### SLA Dashboard Component

```typescript
// components/sla/sla-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { SLAReport } from '@/lib/sla/types';
import { cn } from '@/lib/utils';

interface SLADashboardProps {
  reports: SLAReport[];
  onRefresh?: () => void;
}

export function SLADashboard({ reports, onRefresh }: SLADashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const getStatusColor = (compliance: number, target: number) => {
    const ratio = compliance / target;
    if (ratio >= 1) return 'text-green-600 bg-green-50';
    if (ratio >= 0.995) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (compliance: number, target: number) => {
    const ratio = compliance / target;
    if (ratio >= 1) return 'bg-green-500';
    if (ratio >= 0.995) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (compliance: number, target: number) => {
    const ratio = compliance / target;
    if (ratio >= 1) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Met
        </Badge>
      );
    }
    if (ratio >= 0.995) {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Breached
      </Badge>
    );
  };

  const getTrendIcon = (trend: SLAReport['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
    return `${(minutes / 1440).toFixed(1)}d`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">SLA Dashboard</h2>
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total SLAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meeting Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {reports.filter(r => r.compliance >= r.target).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {reports.filter(r => r.compliance < r.target && r.compliance >= r.target * 0.995).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {reports.filter(r => r.compliance < r.target * 0.995).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.slaId} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-lg">{report.slaName}</CardTitle>
                <CardDescription>{report.serviceName}</CardDescription>
              </div>
              {getStatusBadge(report.compliance, report.target)}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compliance */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Compliance</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(report.trend)}
                    <span className="text-2xl font-bold">
                      {report.compliance.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.min(report.compliance, 100)}
                  className="h-2"
                  indicatorClassName={getProgressColor(report.compliance, report.target)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {report.target}%
                </p>
              </div>

              {/* Error Budget */}
              <div className={cn(
                'p-3 rounded-lg',
                getStatusColor(100 - report.errorBudget.percentUsed, 5)
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Budget</span>
                  <span className="font-semibold">
                    {(100 - report.errorBudget.percentUsed).toFixed(1)}% remaining
                  </span>
                </div>
                <Progress
                  value={100 - report.errorBudget.percentUsed}
                  className="h-1.5 mt-2"
                />
                <p className="text-xs mt-1">
                  {formatDuration(report.errorBudget.remaining)} of {formatDuration(report.errorBudget.total)} left
                </p>
              </div>

              {/* Incidents */}
              {report.incidents.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{report.incidents.length} incident(s) this period</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {report.incidents.slice(0, 2).map((incident) => (
                      <div
                        key={incident.id}
                        className="text-xs flex items-center justify-between"
                      >
                        <span className="truncate">{incident.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {incident.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### SLA Report Export

```typescript
// lib/sla/export.ts
import { SLAReport } from './types';

export function generateSLAReportHTML(reports: SLAReport[]): string {
  const now = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SLA Compliance Report - ${now}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; }
        h1 { color: #1a1a1a; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { padding: 20px; border-radius: 8px; background: #f5f5f5; }
        .summary-card h3 { margin: 0; font-size: 14px; color: #666; }
        .summary-card .value { font-size: 32px; font-weight: bold; margin-top: 8px; }
        .sla-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .sla-table th, .sla-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .sla-table th { background: #f9f9f9; font-weight: 600; }
        .status-met { color: #16a34a; }
        .status-risk { color: #ca8a04; }
        .status-breach { color: #dc2626; }
      </style>
    </head>
    <body>
      <h1>SLA Compliance Report</h1>
      <p>Generated: ${now}</p>

      <div class="summary">
        <div class="summary-card">
          <h3>Total SLAs</h3>
          <div class="value">${reports.length}</div>
        </div>
        <div class="summary-card">
          <h3>Meeting Target</h3>
          <div class="value status-met">${reports.filter(r => r.compliance >= r.target).length}</div>
        </div>
        <div class="summary-card">
          <h3>At Risk</h3>
          <div class="value status-risk">${reports.filter(r => r.compliance < r.target && r.compliance >= r.target * 0.995).length}</div>
        </div>
        <div class="summary-card">
          <h3>Breached</h3>
          <div class="value status-breach">${reports.filter(r => r.compliance < r.target * 0.995).length}</div>
        </div>
      </div>

      <table class="sla-table">
        <thead>
          <tr>
            <th>SLA Name</th>
            <th>Service</th>
            <th>Target</th>
            <th>Actual</th>
            <th>Compliance</th>
            <th>Status</th>
            <th>Incidents</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(r => `
            <tr>
              <td>${r.slaName}</td>
              <td>${r.serviceName}</td>
              <td>${r.target}%</td>
              <td>${r.actual.toFixed(2)}%</td>
              <td>${r.compliance.toFixed(2)}%</td>
              <td class="${r.compliance >= r.target ? 'status-met' : r.compliance >= r.target * 0.995 ? 'status-risk' : 'status-breach'}">
                ${r.compliance >= r.target ? 'Met' : r.compliance >= r.target * 0.995 ? 'At Risk' : 'Breached'}
              </td>
              <td>${r.incidents.length}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}
```

## Examples

### Example 1: API Response Time SLA

```typescript
// Monitor API response times and track against P95 SLA
// lib/middleware/response-time.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SLA_ID = 'api-latency-p95';

export async function responseTimeMiddleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;

  // Record metric asynchronously
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sla/metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.METRICS_API_KEY!,
    },
    body: JSON.stringify({
      slaId: SLA_ID,
      value: duration,
      metadata: {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    }),
  }).catch(console.error);

  return response;
}
```

### Example 2: Multi-Tenant SLA Dashboard

```typescript
// app/dashboard/sla/page.tsx
import { Suspense } from 'react';
import { SLADashboard } from '@/components/sla/sla-dashboard';
import { slaService } from '@/lib/sla/service';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SLAPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Get SLAs for user's organization
  const targets = await slaService.getSLATargets(session.user.organizationId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const reports = await Promise.all(
    targets.map(target =>
      slaService.generateReport(target.id, { start: thirtyDaysAgo, end: now })
    )
  );

  return (
    <div className="container py-8">
      <Suspense fallback={<SLADashboardSkeleton />}>
        <SLADashboard reports={reports} />
      </Suspense>
    </div>
  );
}

function SLADashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Scheduled SLA Report Generation

```typescript
// app/api/cron/sla-reports/route.ts
import { NextResponse } from 'next/server';
import { slaService } from '@/lib/sla/service';
import { generateSLAReportHTML } from '@/lib/sla/export';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

// Vercel Cron: runs daily at midnight
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all organizations with daily reports enabled
    const organizations = await db.organization.findMany({
      where: { slaReportFrequency: 'daily' },
      include: { admins: true },
    });

    for (const org of organizations) {
      const targets = await slaService.getSLATargets(org.id);

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();

      const reports = await Promise.all(
        targets.map(target =>
          slaService.generateReport(target.id, { start: yesterday, end: now })
        )
      );

      const html = generateSLAReportHTML(reports);

      // Send to all admins
      for (const admin of org.admins) {
        await sendEmail({
          to: admin.email,
          subject: `Daily SLA Report - ${org.name}`,
          html,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to generate SLA reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
```

## Anti-patterns

### Anti-pattern 1: Not Using Error Budgets

```typescript
// BAD: Only tracking binary compliance
async function checkSLA(slaId: string) {
  const report = await slaService.generateReport(slaId, { start, end });

  if (report.compliance < report.target) {
    sendAlert('SLA Breached!'); // Too late!
  }
}

// GOOD: Use error budgets for proactive alerting
async function checkSLA(slaId: string) {
  const report = await slaService.generateReport(slaId, { start, end });

  // Alert before breach happens
  if (report.errorBudget.percentUsed >= 80) {
    sendAlert('Warning: 80% of error budget consumed');
  }

  if (report.errorBudget.percentUsed >= 95) {
    sendAlert('Critical: SLA breach imminent, only 5% budget remaining');
  }

  // Calculate burn rate for early warning
  const burnRate = calculateBurnRate(report);
  if (burnRate > 6) { // Burning 6x faster than sustainable
    sendAlert('High burn rate detected - investigate immediately');
  }
}
```

### Anti-pattern 2: Averaging Metrics Incorrectly

```typescript
// BAD: Simple average doesn't reflect user experience
async function calculateAverageLatency(measurements: number[]): Promise<number> {
  return measurements.reduce((a, b) => a + b, 0) / measurements.length;
}

// GOOD: Use percentiles for latency SLAs
async function calculateLatencyPercentiles(
  measurements: number[]
): Promise<{ p50: number; p95: number; p99: number }> {
  const sorted = [...measurements].sort((a, b) => a - b);

  const percentile = (p: number) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };

  return {
    p50: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
  };
}

// For uptime, use time-weighted calculation
async function calculateWeightedUptime(
  incidents: Incident[],
  totalMinutes: number
): Promise<number> {
  const downtimeMinutes = incidents.reduce((sum, inc) => {
    // Weight by severity
    const severityWeight = {
      critical: 1.0,  // Full impact
      major: 0.75,    // 75% impact
      minor: 0.25,    // 25% impact
      warning: 0.1,   // 10% impact
    };
    return sum + (inc.duration * severityWeight[inc.severity]);
  }, 0);

  return ((totalMinutes - downtimeMinutes) / totalMinutes) * 100;
}
```

### Anti-pattern 3: Alert Fatigue

```typescript
// BAD: Alert on every measurement
async function recordMeasurement(slaId: string, value: number) {
  const measurement = await db.slaMeasurement.create({ ... });

  if (!measurement.isCompliant) {
    sendAlert(`SLA ${slaId} not compliant!`); // Spam!
  }
}

// GOOD: Implement alert deduplication and severity-based routing
async function recordMeasurement(slaId: string, value: number) {
  const measurement = await db.slaMeasurement.create({ ... });

  if (!measurement.isCompliant) {
    // Check if we already alerted recently
    const recentAlert = await db.slaAlert.findFirst({
      where: {
        slaId,
        timestamp: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // 15 min window
      },
    });

    if (recentAlert) return; // Don't spam

    // Check trend - is this a blip or sustained issue?
    const recentMeasurements = await db.slaMeasurement.findMany({
      where: {
        slaId,
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    const failureRate = recentMeasurements.filter(m => !m.isCompliant).length / recentMeasurements.length;

    // Only alert if sustained issue (>50% failures in 5 min window)
    if (failureRate > 0.5) {
      await createAlert(slaId, 'warning', 'Sustained SLA degradation detected');
    }
  }
}
```

### Anti-pattern 4: Ignoring Scheduled Maintenance

```typescript
// BAD: Count maintenance as downtime
async function calculateUptime(serviceId: string, period: DateRange) {
  const incidents = await db.incident.findMany({ ... });
  // Maintenance counted same as incidents - unfair!
}

// GOOD: Exclude scheduled maintenance from SLA calculations
async function calculateUptime(serviceId: string, period: DateRange) {
  // Get unplanned incidents only
  const incidents = await db.incident.findMany({
    where: {
      serviceId,
      startTime: { gte: period.start, lte: period.end },
      type: { not: 'scheduled_maintenance' }, // Exclude maintenance
    },
  });

  // Also get maintenance windows for transparency
  const maintenanceWindows = await db.incident.findMany({
    where: {
      serviceId,
      startTime: { gte: period.start, lte: period.end },
      type: 'scheduled_maintenance',
    },
  });

  const totalMinutes = (period.end.getTime() - period.start.getTime()) / 60000;
  const downtimeMinutes = incidents.reduce((sum, inc) => sum + inc.duration, 0);
  const maintenanceMinutes = maintenanceWindows.reduce((sum, mw) => sum + mw.duration, 0);

  return {
    uptime: ((totalMinutes - downtimeMinutes) / totalMinutes) * 100,
    uptimeExcludingMaintenance: ((totalMinutes - downtimeMinutes - maintenanceMinutes) / (totalMinutes - maintenanceMinutes)) * 100,
    maintenanceMinutes,
  };
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/sla/service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SLAService } from '@/lib/sla/service';
import { db } from '@/lib/db';

vi.mock('@/lib/db');

describe('SLAService', () => {
  let service: SLAService;

  beforeEach(() => {
    service = new SLAService();
    vi.clearAllMocks();
  });

  describe('checkCompliance', () => {
    it('returns true for uptime above target', () => {
      const target = { metric: 'uptime', target: 99.9 };
      expect(service['checkCompliance'](target as any, 99.95)).toBe(true);
    });

    it('returns false for uptime below target', () => {
      const target = { metric: 'uptime', target: 99.9 };
      expect(service['checkCompliance'](target as any, 99.5)).toBe(false);
    });

    it('returns true for latency below target', () => {
      const target = { metric: 'latency_p95', target: 200 };
      expect(service['checkCompliance'](target as any, 150)).toBe(true);
    });

    it('returns false for latency above target', () => {
      const target = { metric: 'latency_p95', target: 200 };
      expect(service['checkCompliance'](target as any, 250)).toBe(false);
    });

    it('returns true for error rate below target', () => {
      const target = { metric: 'error_rate', target: 0.1 };
      expect(service['checkCompliance'](target as any, 0.05)).toBe(true);
    });
  });

  describe('calculateUptime', () => {
    it('returns 100% with no incidents', async () => {
      vi.mocked(db.incident.findMany).mockResolvedValue([]);

      const uptime = await service.calculateUptime('service-1', {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-02'),
      });

      expect(uptime).toBe(100);
    });

    it('calculates correct uptime with incidents', async () => {
      vi.mocked(db.incident.findMany).mockResolvedValue([
        {
          startTime: new Date('2024-01-01T12:00:00'),
          endTime: new Date('2024-01-01T12:30:00'), // 30 min downtime
        },
      ] as any);

      const uptime = await service.calculateUptime('service-1', {
        start: new Date('2024-01-01T00:00:00'),
        end: new Date('2024-01-02T00:00:00'), // 1440 minutes
      });

      // (1440 - 30) / 1440 = 97.916...%
      expect(uptime).toBeCloseTo(97.916, 2);
    });
  });

  describe('calculateErrorBudget', () => {
    it('calculates correct error budget', async () => {
      vi.mocked(db.slaTarget.findUnique).mockResolvedValue({
        target: 99.9, // 0.1% error budget
      } as any);

      vi.mocked(db.slaMeasurement.findMany).mockResolvedValue([
        { isCompliant: false },
        { isCompliant: false },
        { isCompliant: false },
      ] as any);

      const budget = await service.calculateErrorBudget('sla-1', {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-02'), // 1440 minutes
      });

      // 0.1% of 1440 = 1.44 minutes total budget
      expect(budget.total).toBeCloseTo(1.44, 2);
      expect(budget.consumed).toBe(3);
      expect(budget.remaining).toBe(0); // Budget exhausted
      expect(budget.percentUsed).toBeGreaterThan(100);
    });
  });

  describe('getPeriodStart', () => {
    it('returns correct start for daily period', () => {
      const date = new Date('2024-01-15T14:30:00');
      const start = service['getPeriodStart'](date, 'daily');

      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getDate()).toBe(15);
    });

    it('returns correct start for monthly period', () => {
      const date = new Date('2024-01-15T14:30:00');
      const start = service['getPeriodStart'](date, 'monthly');

      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(0); // January
    });

    it('returns correct start for weekly period', () => {
      const date = new Date('2024-01-17T14:30:00'); // Wednesday
      const start = service['getPeriodStart'](date, 'weekly');

      expect(start.getDay()).toBe(0); // Sunday
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/sla.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as reportHandler from '@/app/api/sla/[id]/report/route';

describe('SLA API', () => {
  describe('GET /api/sla/[id]/report', () => {
    it('returns SLA report for valid request', async () => {
      await testApiHandler({
        appHandler: reportHandler,
        params: { id: 'sla-1' },
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'GET',
            headers: {
              Authorization: 'Bearer valid-token',
            },
          });

          expect(res.status).toBe(200);

          const data = await res.json();
          expect(data).toHaveProperty('slaId');
          expect(data).toHaveProperty('compliance');
          expect(data).toHaveProperty('errorBudget');
        },
      });
    });

    it('returns 401 for unauthenticated requests', async () => {
      await testApiHandler({
        appHandler: reportHandler,
        params: { id: 'sla-1' },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(401);
        },
      });
    });
  });
});
```

## Related Skills

- [Uptime Monitoring](./uptime-monitoring.md) - Health checks and availability monitoring
- [Alerting System](./alerting.md) - Multi-channel notification delivery
- [Logging Infrastructure](./logging.md) - Centralized log aggregation and analysis
- [Metrics Dashboard](./metrics-dashboard.md) - Real-time metrics visualization
- [Incident Management](./incident-management.md) - Incident tracking and resolution
- [Data Tables](../organisms/data-table.md) - Tabular data display components

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive error budget calculation
- Added multi-tenant SLA dashboard example
- Added scheduled report generation with email delivery
- Added incident timeline tracking
- Expanded anti-patterns with burn rate monitoring
- Added API routes for metrics ingestion
- Added integration tests
- Improved alert deduplication logic
- Added trend analysis (improving/stable/degrading)
- Added HTML report export functionality

### 1.0.0 (2025-01-15)
- Initial implementation
- SLA configuration types
- Metrics collection service
- Dashboard components
