---
id: pt-usage-metering
name: Usage-Based Billing Metering
version: 1.0.0
layer: L5
category: billing
description: Usage-based billing and metering for Next.js SaaS applications
tags: [billing, metering, usage, stripe, saas, next15]
composes:
  - ../molecules/card.md
  - ../molecules/progress-bar.md
  - ../atoms/feedback-alert.md
dependencies: []
formula: Event Tracking + Aggregation + Stripe Metering = Usage-Based Billing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Usage-Based Billing Metering

## When to Use

- **API products**: Charging per API call or request
- **Resource consumption**: Billing for storage, compute, or bandwidth
- **Feature-based pricing**: Charging for specific feature usage
- **Hybrid models**: Combining subscription with usage-based charges

**Avoid when**: Fixed pricing suffices, or usage tracking is not feasible.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Usage Metering Architecture                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Metering Service                                      │  │
│  │  ├─ Event Collection: Real-time usage recording      │  │
│  │  ├─ Aggregation: Hourly/daily usage summaries        │  │
│  │  └─ Billing Sync: Stripe meter event reporting       │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Usage      │     │ Usage        │     │ Invoice     │   │
│  │ Limits     │     │ Dashboard    │     │ Generation  │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Types and Configuration

```typescript
// lib/metering/types.ts
export type UsageEventType =
  | 'api_call'
  | 'storage_bytes'
  | 'compute_seconds'
  | 'tokens'
  | 'messages'
  | 'seats';

export interface UsageEvent {
  id: string;
  customerId: string;
  eventType: UsageEventType;
  quantity: number;
  metadata?: Record<string, string>;
  timestamp: Date;
  idempotencyKey?: string;
}

export interface UsageSummary {
  customerId: string;
  eventType: UsageEventType;
  periodStart: Date;
  periodEnd: Date;
  totalQuantity: number;
  eventCount: number;
}

export interface UsageLimit {
  eventType: UsageEventType;
  limit: number;
  used: number;
  resetAt: Date;
}

// Pricing configuration
export const USAGE_PRICING: Record<UsageEventType, {
  unitName: string;
  pricePerUnit: number;
  includedUnits: number;
  stripeMeterId?: string;
}> = {
  api_call: {
    unitName: 'API calls',
    pricePerUnit: 0.001,
    includedUnits: 10000,
    stripeMeterId: process.env.STRIPE_API_CALLS_METER_ID,
  },
  storage_bytes: {
    unitName: 'GB stored',
    pricePerUnit: 0.02,
    includedUnits: 5 * 1024 * 1024 * 1024, // 5GB
    stripeMeterId: process.env.STRIPE_STORAGE_METER_ID,
  },
  tokens: {
    unitName: 'tokens',
    pricePerUnit: 0.00001,
    includedUnits: 100000,
    stripeMeterId: process.env.STRIPE_TOKENS_METER_ID,
  },
  compute_seconds: {
    unitName: 'compute seconds',
    pricePerUnit: 0.0001,
    includedUnits: 3600,
    stripeMeterId: process.env.STRIPE_COMPUTE_METER_ID,
  },
  messages: {
    unitName: 'messages',
    pricePerUnit: 0.002,
    includedUnits: 1000,
    stripeMeterId: process.env.STRIPE_MESSAGES_METER_ID,
  },
  seats: {
    unitName: 'seats',
    pricePerUnit: 10,
    includedUnits: 1,
    stripeMeterId: process.env.STRIPE_SEATS_METER_ID,
  },
};
```

## Metering Service

```typescript
// lib/metering/service.ts
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe/client';
import { UsageEvent, UsageEventType, UsageSummary, UsageLimit, USAGE_PRICING } from './types';
import { nanoid } from 'nanoid';

export class MeteringService {
  async recordUsage(
    customerId: string,
    eventType: UsageEventType,
    quantity: number,
    metadata?: Record<string, string>,
    idempotencyKey?: string
  ): Promise<UsageEvent> {
    // Check idempotency
    if (idempotencyKey) {
      const existing = await db.usageEvent.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing as UsageEvent;
    }

    // Record the event
    const event = await db.usageEvent.create({
      data: {
        id: nanoid(),
        customerId,
        eventType,
        quantity,
        metadata,
        idempotencyKey,
        timestamp: new Date(),
      },
    });

    // Report to Stripe asynchronously
    this.reportToStripe(customerId, eventType, quantity).catch(console.error);

    return event as UsageEvent;
  }

  private async reportToStripe(
    customerId: string,
    eventType: UsageEventType,
    quantity: number
  ): Promise<void> {
    const pricing = USAGE_PRICING[eventType];
    if (!pricing.stripeMeterId) return;

    const customer = await db.user.findUnique({
      where: { id: customerId },
      select: { stripeCustomerId: true },
    });

    if (!customer?.stripeCustomerId) return;

    await stripe.billing.meterEvents.create({
      event_name: eventType,
      payload: {
        stripe_customer_id: customer.stripeCustomerId,
        value: quantity.toString(),
      },
    });
  }

  async getUsageSummary(
    customerId: string,
    eventType: UsageEventType,
    periodStart: Date,
    periodEnd: Date
  ): Promise<UsageSummary> {
    const result = await db.usageEvent.aggregate({
      where: {
        customerId,
        eventType,
        timestamp: { gte: periodStart, lte: periodEnd },
      },
      _sum: { quantity: true },
      _count: true,
    });

    return {
      customerId,
      eventType,
      periodStart,
      periodEnd,
      totalQuantity: result._sum.quantity || 0,
      eventCount: result._count,
    };
  }

  async getCurrentPeriodUsage(customerId: string): Promise<Record<UsageEventType, UsageSummary>> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const eventTypes: UsageEventType[] = ['api_call', 'storage_bytes', 'tokens', 'compute_seconds', 'messages', 'seats'];

    const summaries = await Promise.all(
      eventTypes.map((type) => this.getUsageSummary(customerId, type, periodStart, periodEnd))
    );

    return Object.fromEntries(
      summaries.map((summary) => [summary.eventType, summary])
    ) as Record<UsageEventType, UsageSummary>;
  }

  async checkLimit(
    customerId: string,
    eventType: UsageEventType,
    requestedQuantity: number
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = await db.user.findUnique({
      where: { id: customerId },
      include: { subscription: true },
    });

    // Get plan limits
    const planLimits = this.getPlanLimits(user?.subscription?.plan || 'free');
    const limit = planLimits[eventType];

    // Get current usage
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const summary = await this.getUsageSummary(customerId, eventType, periodStart, new Date());

    const used = summary.totalQuantity;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: remaining >= requestedQuantity,
      remaining,
      limit,
    };
  }

  private getPlanLimits(plan: string): Record<UsageEventType, number> {
    const limits: Record<string, Record<UsageEventType, number>> = {
      free: {
        api_call: 1000,
        storage_bytes: 100 * 1024 * 1024,
        tokens: 10000,
        compute_seconds: 60,
        messages: 100,
        seats: 1,
      },
      pro: {
        api_call: 100000,
        storage_bytes: 10 * 1024 * 1024 * 1024,
        tokens: 1000000,
        compute_seconds: 36000,
        messages: 10000,
        seats: 10,
      },
      enterprise: {
        api_call: Infinity,
        storage_bytes: Infinity,
        tokens: Infinity,
        compute_seconds: Infinity,
        messages: Infinity,
        seats: Infinity,
      },
    };

    return limits[plan] || limits.free;
  }

  async estimateBill(customerId: string): Promise<{
    includedUsage: number;
    overageCharges: number;
    total: number;
    breakdown: { type: UsageEventType; quantity: number; charge: number }[];
  }> {
    const usage = await this.getCurrentPeriodUsage(customerId);
    let overageCharges = 0;
    const breakdown: { type: UsageEventType; quantity: number; charge: number }[] = [];

    for (const [type, summary] of Object.entries(usage)) {
      const pricing = USAGE_PRICING[type as UsageEventType];
      const overage = Math.max(0, summary.totalQuantity - pricing.includedUnits);
      const charge = overage * pricing.pricePerUnit;

      if (charge > 0) {
        overageCharges += charge;
        breakdown.push({
          type: type as UsageEventType,
          quantity: overage,
          charge,
        });
      }
    }

    return {
      includedUsage: 0, // Base subscription covers this
      overageCharges,
      total: overageCharges,
      breakdown,
    };
  }
}

export const meteringService = new MeteringService();
```

## Usage Tracking Middleware

```typescript
// lib/metering/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { meteringService } from './service';
import { auth } from '@/lib/auth';

export async function withUsageTracking(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check limits before processing
  const limitCheck = await meteringService.checkLimit(session.user.id, 'api_call', 1);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: 'Usage limit exceeded', remaining: limitCheck.remaining },
      { status: 429 }
    );
  }

  const startTime = Date.now();
  const response = await handler();
  const duration = Date.now() - startTime;

  // Record usage asynchronously
  meteringService.recordUsage(
    session.user.id,
    'api_call',
    1,
    {
      path: request.nextUrl.pathname,
      method: request.method,
      duration: duration.toString(),
    }
  ).catch(console.error);

  return response;
}
```

## Usage Dashboard Component

```typescript
// components/metering/usage-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { USAGE_PRICING, UsageEventType, UsageSummary } from '@/lib/metering/types';
import { AlertTriangle } from 'lucide-react';

interface UsageDashboardProps {
  limits: Record<UsageEventType, number>;
}

export function UsageDashboard({ limits }: UsageDashboardProps) {
  const [usage, setUsage] = useState<Record<UsageEventType, UsageSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage/current')
      .then((res) => res.json())
      .then(setUsage)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !usage) return <div>Loading...</div>;

  const eventTypes: UsageEventType[] = ['api_call', 'tokens', 'storage_bytes', 'messages'];

  return (
    <div className="space-y-6">
      {eventTypes.map((type) => {
        const summary = usage[type];
        const limit = limits[type];
        const pricing = USAGE_PRICING[type];
        const percentage = (summary.totalQuantity / limit) * 100;
        const isNearLimit = percentage > 80;

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {pricing.unitName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatNumber(summary.totalQuantity)} used</span>
                  <span>{formatNumber(limit)} limit</span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={isNearLimit ? 'bg-orange-100' : ''}
                />
                {isNearLimit && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You&apos;ve used {percentage.toFixed(0)}% of your {pricing.unitName} limit
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

## Related Patterns

- [stripe-payments](./stripe-payments.md)
- [token-counting](./token-counting.md)
- [storage-quotas](./storage-quotas.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Event recording with idempotency
- Stripe meter integration
- Usage dashboard component
