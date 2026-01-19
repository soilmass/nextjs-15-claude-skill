---
id: pt-alerting
name: Alerting System
version: 2.0.0
layer: L5
category: observability
description: Configurable alerting with thresholds, escalation policies, and multi-channel notifications
tags: [alerting, monitoring, notifications, pagerduty, slack, email]
composes: []
dependencies:
  prom-client: "^15.1.0"
formula: metrics + thresholds + channels + escalation = proactive incident response
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Alerting System

Build a robust alerting system with configurable rules, escalation, and multi-channel delivery.

## When to Use

- Production applications requiring proactive incident detection
- Systems with SLAs/SLOs that need automated monitoring
- Teams requiring on-call rotation and escalation workflows
- Applications where metric thresholds indicate potential issues
- Multi-channel notification requirements (Slack, PagerDuty, email)

## Composition Diagram

```
+-------------------+     +------------------+     +-------------------+
|     pt-metrics    |---->|   pt-alerting    |---->|   Notification    |
|  (Data Source)    |     |  (Rule Engine)   |     |    Channels       |
+-------------------+     +------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +------------------+     +-------------------+
|   pt-logging      |     | Threshold Check  |     | Slack/PagerDuty   |
| (Context Data)    |     |   & Grouping     |     |  Email/Webhook    |
+-------------------+     +------------------+     +-------------------+
        |                         |
        v                         v
+-------------------+     +------------------+
| pt-error-tracking |     |   Escalation     |
|(Error Correlation)|     |    Policies      |
+-------------------+     +------------------+
```

## Overview

This pattern covers:
- Alert rule configuration
- Threshold-based alerting
- Anomaly detection
- Multi-channel notifications (Email, Slack, PagerDuty)
- Escalation policies
- Alert deduplication and grouping
- On-call scheduling

## Implementation

### Alert Types and Configuration

```typescript
// lib/alerting/types.ts
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'firing' | 'resolved' | 'acknowledged' | 'silenced';
export type AlertChannel = 'email' | 'slack' | 'pagerduty' | 'webhook' | 'sms';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Condition
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds the condition must be true
  
  // Classification
  severity: AlertSeverity;
  labels: Record<string, string>;
  
  // Notification
  channels: AlertChannel[];
  notifyInterval: number; // seconds between notifications while firing
  
  // Escalation
  escalateAfter?: number; // seconds before escalation
  escalateTo?: AlertChannel[];
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  status: AlertStatus;
  severity: AlertSeverity;
  
  message: string;
  description?: string;
  
  labels: Record<string, string>;
  annotations: Record<string, string>;
  
  value: number;
  threshold: number;
  
  firedAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  
  lastNotifiedAt?: Date;
  notificationCount: number;
}

export interface AlertNotification {
  alertId: string;
  channel: AlertChannel;
  sentAt: Date;
  success: boolean;
  error?: string;
}
```

### Alert Manager

```typescript
// lib/alerting/manager.ts
import { prisma } from '@/lib/prisma';
import { sendNotification } from './notifications';
import type { Alert, AlertRule, AlertStatus } from './types';

class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private conditionStates: Map<string, { startTime: number; value: number }> = new Map();

  constructor() {
    this.loadRules();
  }

  /**
   * Load alert rules from database
   */
  async loadRules() {
    const rules = await prisma.alertRule.findMany({
      where: { enabled: true },
    });

    rules.forEach((rule) => {
      this.rules.set(rule.id, rule as unknown as AlertRule);
    });
  }

  /**
   * Evaluate a metric against all rules
   */
  async evaluate(metric: string, value: number, labels: Record<string, string> = {}) {
    for (const [ruleId, rule] of this.rules) {
      if (rule.metric !== metric) continue;

      const alertKey = this.getAlertKey(ruleId, labels);
      const conditionMet = this.checkCondition(rule, value);
      const state = this.conditionStates.get(alertKey);

      if (conditionMet) {
        if (!state) {
          // Start tracking condition
          this.conditionStates.set(alertKey, {
            startTime: Date.now(),
            value,
          });
        } else {
          // Check if duration threshold is met
          const duration = (Date.now() - state.startTime) / 1000;
          
          if (duration >= rule.duration) {
            await this.fireAlert(rule, value, labels);
          }
        }
      } else {
        // Condition no longer met
        this.conditionStates.delete(alertKey);
        
        // Resolve any active alert
        const activeAlert = this.activeAlerts.get(alertKey);
        if (activeAlert && activeAlert.status === 'firing') {
          await this.resolveAlert(alertKey);
        }
      }
    }
  }

  /**
   * Check if condition is met
   */
  private checkCondition(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'gt': return value > rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'eq': return value === rule.threshold;
      case 'gte': return value >= rule.threshold;
      case 'lte': return value <= rule.threshold;
      default: return false;
    }
  }

  /**
   * Fire an alert
   */
  private async fireAlert(
    rule: AlertRule,
    value: number,
    labels: Record<string, string>
  ) {
    const alertKey = this.getAlertKey(rule.id, labels);
    const existingAlert = this.activeAlerts.get(alertKey);

    if (existingAlert) {
      // Check if we should re-notify
      const timeSinceLastNotify = existingAlert.lastNotifiedAt
        ? Date.now() - existingAlert.lastNotifiedAt.getTime()
        : Infinity;

      if (timeSinceLastNotify >= rule.notifyInterval * 1000) {
        await this.notify(existingAlert, rule.channels);
        
        // Check for escalation
        if (rule.escalateAfter && rule.escalateTo) {
          const timeSinceFired = Date.now() - existingAlert.firedAt.getTime();
          if (timeSinceFired >= rule.escalateAfter * 1000) {
            await this.notify(existingAlert, rule.escalateTo, true);
          }
        }
      }
      return;
    }

    // Create new alert
    const alert: Alert = {
      id: `${alertKey}-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'firing',
      severity: rule.severity,
      message: `${rule.name}: ${value} ${this.getConditionText(rule)} ${rule.threshold}`,
      labels: { ...rule.labels, ...labels },
      annotations: {},
      value,
      threshold: rule.threshold,
      firedAt: new Date(),
      notificationCount: 0,
    };

    this.activeAlerts.set(alertKey, alert);

    // Store in database
    await prisma.alert.create({
      data: {
        id: alert.id,
        ruleId: alert.ruleId,
        ruleName: alert.ruleName,
        status: alert.status,
        severity: alert.severity,
        message: alert.message,
        labels: alert.labels,
        value: alert.value,
        threshold: alert.threshold,
        firedAt: alert.firedAt,
      },
    });

    // Send notifications
    await this.notify(alert, rule.channels);
  }

  /**
   * Resolve an alert
   */
  private async resolveAlert(alertKey: string) {
    const alert = this.activeAlerts.get(alertKey);
    if (!alert) return;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    // Update database
    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        status: 'resolved',
        resolvedAt: alert.resolvedAt,
      },
    });

    // Send resolution notification
    const rule = this.rules.get(alert.ruleId);
    if (rule) {
      await this.notify(alert, rule.channels);
    }

    this.activeAlerts.delete(alertKey);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledge(alertId: string, userId: string) {
    const alert = Array.from(this.activeAlerts.values()).find(
      (a) => a.id === alertId
    );
    
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;

    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'acknowledged',
        acknowledgedAt: alert.acknowledgedAt,
        acknowledgedBy: userId,
      },
    });

    return alert;
  }

  /**
   * Silence an alert
   */
  async silence(alertId: string, duration: number) {
    const alert = Array.from(this.activeAlerts.values()).find(
      (a) => a.id === alertId
    );
    
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'silenced';

    await prisma.alert.update({
      where: { id: alertId },
      data: { status: 'silenced' },
    });

    // Unsilence after duration
    setTimeout(() => {
      if (alert.status === 'silenced') {
        alert.status = 'firing';
        prisma.alert.update({
          where: { id: alertId },
          data: { status: 'firing' },
        });
      }
    }, duration * 1000);

    return alert;
  }

  /**
   * Send notifications to channels
   */
  private async notify(
    alert: Alert,
    channels: AlertChannel[],
    isEscalation = false
  ) {
    for (const channel of channels) {
      try {
        await sendNotification(channel, alert, isEscalation);
        
        await prisma.alertNotification.create({
          data: {
            alertId: alert.id,
            channel,
            sentAt: new Date(),
            success: true,
          },
        });
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        
        await prisma.alertNotification.create({
          data: {
            alertId: alert.id,
            channel,
            sentAt: new Date(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    alert.lastNotifiedAt = new Date();
    alert.notificationCount++;
  }

  /**
   * Get unique alert key
   */
  private getAlertKey(ruleId: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return `${ruleId}:${labelStr}`;
  }

  /**
   * Get condition text for message
   */
  private getConditionText(rule: AlertRule): string {
    const conditions: Record<string, string> = {
      gt: '>',
      lt: '<',
      eq: '==',
      gte: '>=',
      lte: '<=',
    };
    return conditions[rule.condition] || rule.condition;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }
}

export const alertManager = new AlertManager();
```

### Notification Channels

```typescript
// lib/alerting/notifications.ts
import { Resend } from 'resend';
import type { Alert, AlertChannel } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotification(
  channel: AlertChannel,
  alert: Alert,
  isEscalation: boolean
) {
  switch (channel) {
    case 'email':
      return sendEmailNotification(alert, isEscalation);
    case 'slack':
      return sendSlackNotification(alert, isEscalation);
    case 'pagerduty':
      return sendPagerDutyNotification(alert, isEscalation);
    case 'webhook':
      return sendWebhookNotification(alert, isEscalation);
    default:
      throw new Error(`Unknown channel: ${channel}`);
  }
}

// Email notification
async function sendEmailNotification(alert: Alert, isEscalation: boolean) {
  const subject = `${isEscalation ? '[ESCALATION] ' : ''}[${alert.severity.toUpperCase()}] ${alert.ruleName}`;
  
  await resend.emails.send({
    from: 'alerts@example.com',
    to: process.env.ALERT_EMAIL!.split(','),
    subject,
    html: `
      <h2>${alert.status === 'resolved' ? '✅ Resolved' : '🚨 Alert'}: ${alert.ruleName}</h2>
      <p><strong>Status:</strong> ${alert.status}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Value:</strong> ${alert.value}</p>
      <p><strong>Threshold:</strong> ${alert.threshold}</p>
      <p><strong>Fired At:</strong> ${alert.firedAt.toISOString()}</p>
      ${alert.resolvedAt ? `<p><strong>Resolved At:</strong> ${alert.resolvedAt.toISOString()}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alert.id}">View Alert</a></p>
    `,
  });
}

// Slack notification
async function sendSlackNotification(alert: Alert, isEscalation: boolean) {
  const color = {
    info: '#2196F3',
    warning: '#FF9800',
    error: '#F44336',
    critical: '#9C27B0',
  }[alert.severity];

  const emoji = alert.status === 'resolved' ? '✅' : '🚨';

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: `${emoji} ${isEscalation ? '[ESCALATION] ' : ''}${alert.ruleName}`,
          text: alert.message,
          fields: [
            { title: 'Status', value: alert.status, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Value', value: String(alert.value), short: true },
            { title: 'Threshold', value: String(alert.threshold), short: true },
          ],
          footer: alert.status === 'resolved' 
            ? `Resolved at ${alert.resolvedAt?.toISOString()}`
            : `Fired at ${alert.firedAt.toISOString()}`,
          actions: alert.status === 'firing' ? [
            {
              type: 'button',
              text: 'Acknowledge',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/api/alerts/${alert.id}/acknowledge`,
            },
            {
              type: 'button',
              text: 'View',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alert.id}`,
            },
          ] : [],
        },
      ],
    }),
  });
}

// PagerDuty notification
async function sendPagerDutyNotification(alert: Alert, isEscalation: boolean) {
  const eventAction = alert.status === 'resolved' ? 'resolve' : 'trigger';
  
  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: eventAction,
      dedup_key: alert.id,
      payload: {
        summary: `${isEscalation ? '[ESCALATION] ' : ''}${alert.message}`,
        severity: alert.severity === 'critical' ? 'critical' : 
                  alert.severity === 'error' ? 'error' : 
                  alert.severity === 'warning' ? 'warning' : 'info',
        source: 'next-app',
        timestamp: alert.firedAt.toISOString(),
        custom_details: {
          value: alert.value,
          threshold: alert.threshold,
          labels: alert.labels,
        },
      },
      links: [
        {
          href: `${process.env.NEXT_PUBLIC_APP_URL}/alerts/${alert.id}`,
          text: 'View Alert',
        },
      ],
    }),
  });
}

// Generic webhook notification
async function sendWebhookNotification(alert: Alert, isEscalation: boolean) {
  await fetch(process.env.ALERT_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alert,
      isEscalation,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

### API Routes

```typescript
// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { alertManager } from '@/lib/alerting/manager';
import { prisma } from '@/lib/prisma';

// Get all alerts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { firedAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(alerts);
}

// Create alert rule
export async function POST(request: Request) {
  const rule = await request.json();

  const created = await prisma.alertRule.create({
    data: rule,
  });

  await alertManager.loadRules();

  return NextResponse.json(created);
}

// app/api/alerts/[id]/acknowledge/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { alertManager } from '@/lib/alerting/manager';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const alert = await alertManager.acknowledge(id, session.user.id);
  
  return NextResponse.json(alert);
}
```

### Alert Metrics Collector

```typescript
// lib/alerting/collector.ts
import { alertManager } from './manager';

// Collect and evaluate metrics periodically
export async function collectMetrics() {
  // Error rate
  const errorRate = await calculateErrorRate();
  await alertManager.evaluate('error_rate', errorRate);

  // Response time (p95)
  const responseTime = await calculateP95ResponseTime();
  await alertManager.evaluate('response_time_p95', responseTime);

  // CPU usage (if applicable)
  // Memory usage
  // Queue depth
  // etc.
}

async function calculateErrorRate(): Promise<number> {
  const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
  
  const [total, errors] = await Promise.all([
    prisma.request.count({ where: { createdAt: { gte: since } } }),
    prisma.request.count({ 
      where: { 
        createdAt: { gte: since },
        status: { gte: 500 },
      } 
    }),
  ]);

  return total > 0 ? (errors / total) * 100 : 0;
}

async function calculateP95ResponseTime(): Promise<number> {
  const since = new Date(Date.now() - 5 * 60 * 1000);
  
  const result = await prisma.$queryRaw`
    SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95
    FROM requests
    WHERE created_at >= ${since}
  `;

  return (result as any)[0]?.p95 || 0;
}

import { prisma } from '@/lib/prisma';
```

### Alert Dashboard Component

```typescript
// components/alerts/alert-list.tsx
'use client';

import { useState } from 'react';
import type { Alert } from '@/lib/alerting/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface AlertListProps {
  alerts: Alert[];
}

export function AlertList({ alerts }: AlertListProps) {
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId);
    try {
      await fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
      // Refresh alerts
      window.location.reload();
    } finally {
      setAcknowledging(null);
    }
  };

  const severityColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800',
  };

  const statusColors = {
    firing: 'bg-red-500',
    resolved: 'bg-green-500',
    acknowledged: 'bg-yellow-500',
    silenced: 'bg-gray-500',
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="border rounded-lg p-4 flex items-start gap-4"
        >
          <div className={`w-3 h-3 rounded-full mt-1 ${statusColors[alert.status]}`} />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{alert.ruleName}</h3>
              <Badge className={severityColors[alert.severity]}>
                {alert.severity}
              </Badge>
              <Badge variant="outline">{alert.status}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {alert.message}
            </p>
            
            <div className="text-xs text-muted-foreground mt-2">
              Fired {formatDistanceToNow(new Date(alert.firedAt))} ago
              {alert.resolvedAt && (
                <> • Resolved {formatDistanceToNow(new Date(alert.resolvedAt))} ago</>
              )}
            </div>
          </div>

          {alert.status === 'firing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAcknowledge(alert.id)}
              disabled={acknowledging === alert.id}
            >
              {acknowledging === alert.id ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Anti-patterns

1. **Alert fatigue** - Too many low-priority alerts desensitize responders
2. **No escalation** - Critical issues need automatic escalation
3. **Missing context** - Alerts should include actionable information
4. **No deduplication** - Same alert firing repeatedly wastes time
5. **No resolution notifications** - Team needs to know when issues are fixed

## Related Skills

- [[observability]] - Observability infrastructure
- [[error-tracking]] - Error tracking integration
- [[webhooks]] - Webhook handling
- [[metrics]] - Metrics collection

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial alerting system with multi-channel notifications and escalation
